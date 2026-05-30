import { Worker } from 'bullmq'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { publishJobs } from '@/lib/db/schema'
import { tiktokClient } from '@/lib/tiktok/client'
import { collectMetrics } from '@/modules/analytics/metrics-collector'
import type { PublishJobData, AnalyticsJobData } from '@/lib/queue/jobs'

const rawRedisUrl = process.env.REDIS_URL!
const redisMatch = rawRedisUrl.match(/^rediss?:\/\/(?:[^:]+):([^@]+)@([^:]+):(\d+)/)!
const connection = {
  host: redisMatch[2],
  port: parseInt(redisMatch[3], 10),
  password: redisMatch[1],
  tls: rawRedisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
  enableReadyCheck: false,
  maxRetriesPerRequest: null as null,
}

// Publish worker: post video to TikTok and update publishJob status
const publishWorker = new Worker<PublishJobData>(
  'publish',
  async (job) => {
    const { publishJobId } = job.data

    const publishJob = await db.query.publishJobs.findFirst({
      where: eq(publishJobs.id, publishJobId),
      with: { video: true },
    })

    if (!publishJob) throw new Error(`PublishJob ${publishJobId} not found`)
    if (!publishJob.video.videoUrl) throw new Error('Video URL not ready')

    const post = await tiktokClient.schedulePost({
      videoUrl: publishJob.video.videoUrl,
      caption: `${publishJob.caption}\n\n${(publishJob.hashtags as string[]).join(' ')}`,
      scheduledAt: new Date(publishJob.scheduledAt),
    })

    await db.update(publishJobs)
      .set({
        tiktokPostId: post.publish_id,
        status: 'published',
        publishedAt: new Date(),
      })
      .where(eq(publishJobs.id, publishJobId))
  },
  { connection }
)

// Analytics worker: collect TikTok metrics for a published video
const analyticsWorker = new Worker<AnalyticsJobData>(
  'analytics',
  async (job) => {
    const { publishJobId, tiktokPostId } = job.data
    await collectMetrics(publishJobId, tiktokPostId)
  },
  { connection }
)

publishWorker.on('failed', (job, err) => {
  if (job) console.error(`[publish] job ${job.id} failed:`, err.message)
})

analyticsWorker.on('failed', (job, err) => {
  if (job) console.error(`[analytics] job ${job.id} failed:`, err.message)
})

console.log('Workers started: publish, analytics')
