import { tiktokClient } from '@/lib/tiktok/client'
import { db } from '@/lib/db'
import { analyticsSnapshots } from '@/lib/db/schema'
import type { VideoMetrics } from './types'

export async function collectMetrics(publishJobId: string, tiktokPostId: string): Promise<VideoMetrics> {
  const raw = await tiktokClient.getVideoMetrics(tiktokPostId)

  const metrics: VideoMetrics = {
    tiktokPostId: raw.post_id,
    views: raw.view_count,
    likes: raw.like_count,
    comments: raw.comment_count,
    shares: raw.share_count,
    saves: raw.collect_count,
    avgWatchTime: raw.average_time_watched,
    completionRate: raw.full_video_watched_rate,
  }

  await db.insert(analyticsSnapshots).values({
    publishJobId,
    tiktokPostId,
    views: metrics.views,
    likes: metrics.likes,
    comments: metrics.comments,
    shares: metrics.shares,
    saves: metrics.saves,
    avgWatchTime: metrics.avgWatchTime,
    completionRate: metrics.completionRate,
  })

  return metrics
}
