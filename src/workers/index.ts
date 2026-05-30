import { Worker } from 'bullmq'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { videos, publishJobs } from '@/lib/db/schema'
import { topviewClient } from '@/lib/topview/client'
import { tiktokClient } from '@/lib/tiktok/client'
import { collectMetrics } from '@/modules/analytics/metrics-collector'
import { renderWithCreatomate } from '@/modules/production/video-pipeline'
import type { ProductionJobData, PublishJobData, AnalyticsJobData } from '@/lib/queue/jobs'

const redisUrl = new URL(process.env.REDIS_URL!)
const connection = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port) || 6379,
  password: decodeURIComponent(redisUrl.password),
  tls: process.env.REDIS_URL!.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
}

// Production worker: poll TopView → on done, trigger Creatomate render
const productionWorker = new Worker<ProductionJobData>(
  'production',
  async (job) => {
    const { videoId } = job.data

    const video = await db.query.videos.findFirst({
      where: eq(videos.id, videoId),
      with: {
        script: {
          with: { product: true },
        },
      },
    })

    if (!video?.topviewJobId) {
      throw new Error(`No video/topviewJobId found for videoId ${videoId}`)
    }

    const topviewJob = await topviewClient.getJob(video.topviewJobId)

    if (topviewJob.status === 'completed' && topviewJob.videoUrl) {
      const { jobId: creatomateJobId } = await renderWithCreatomate({
        rawVideoUrl: topviewJob.videoUrl,
        series: video.script.series,
        productName: video.script.product.name,
        hook: video.script.hook,
      })

      await db.update(videos)
        .set({ creatomateJobId, updatedAt: new Date() })
        .where(eq(videos.id, video.id))
      // Creatomate will call /api/webhooks/creatomate when render completes
    } else if (topviewJob.status === 'failed') {
      await db.update(videos)
        .set({
          status: 'failed',
          errorMessage: topviewJob.errorMessage ?? 'TopView job failed',
          updatedAt: new Date(),
        })
        .where(eq(videos.id, video.id))
    } else {
      // still processing — throw to trigger BullMQ retry with backoff
      throw new Error('TopView job still processing')
    }
  },
  { connection }
)

// Publish worker: post video to TikTok and update publishJob status
const publishWorker = new Worker<PublishJobData>(
  'publish',
  async (job) => {
    const { publishJobId } = job.data

    const publishJob = await db.query.publishJobs.findFirst({
      where: eq(publishJobs.id, publishJobId),
      with: {
        video: true,
      },
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

productionWorker.on('failed', (job, err) => {
  if (job) {
    console.error(`[production] job ${job.id} failed:`, err.message)
  }
})

publishWorker.on('failed', (job, err) => {
  if (job) {
    console.error(`[publish] job ${job.id} failed:`, err.message)
  }
})

analyticsWorker.on('failed', (job, err) => {
  if (job) {
    console.error(`[analytics] job ${job.id} failed:`, err.message)
  }
})

console.log('Workers started: production, publish, analytics')
