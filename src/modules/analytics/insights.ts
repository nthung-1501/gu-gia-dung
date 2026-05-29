import { generateJSON } from '@/lib/ai/claude'
import type { VideoMetrics, VideoInsight, ChannelInsight } from './types'

const INSIGHT_SYSTEM_PROMPT = `Bạn là analytics specialist cho kênh TikTok "Gu Gia Dụng" — review đồ gia dụng Việt Nam.
Phân tích metrics và đưa ra insight thực tế, cụ thể để cải thiện content strategy.`

export function calculateEngagementRate(metrics: VideoMetrics): number {
  if (metrics.views === 0) return 0
  const engagements = metrics.likes + metrics.comments + metrics.shares + metrics.saves
  return (engagements / metrics.views) * 100
}

export function classifyPerformance(metrics: VideoMetrics): 'winner' | 'average' | 'underperformer' {
  const er = calculateEngagementRate(metrics)
  if (er >= 5) return 'winner'
  if (er >= 2) return 'average'
  return 'underperformer'
}

export async function generateVideoInsight(
  metrics: VideoMetrics,
  context: { productName: string; series: string; hook: string }
): Promise<VideoInsight> {
  const engagementRate = calculateEngagementRate(metrics)
  const performance = classifyPerformance(metrics)

  const userMessage = `Phân tích video TikTok:
Sản phẩm: ${context.productName}
Series: ${context.series}
Hook: ${context.hook}
Views: ${metrics.views}
Likes: ${metrics.likes} | Comments: ${metrics.comments} | Shares: ${metrics.shares} | Saves: ${metrics.saves}
Engagement Rate: ${engagementRate.toFixed(2)}%
Avg Watch Time: ${metrics.avgWatchTime ?? 'N/A'}s
Completion Rate: ${metrics.completionRate ? `${(metrics.completionRate * 100).toFixed(1)}%` : 'N/A'}

Output JSON:
{
  "postId": "${metrics.tiktokPostId}",
  "performance": "${performance}",
  "engagementRate": ${engagementRate},
  "retentionScore": số từ 0-10,
  "recommendations": ["gợi ý cải thiện 1", "gợi ý 2"],
  "topicsToRepeat": ["chủ đề/angle nên làm lại"],
  "topicsToAvoid": ["chủ đề/angle nên tránh"]
}`

  return generateJSON<VideoInsight>(INSIGHT_SYSTEM_PROMPT, userMessage, { maxTokens: 512 })
}

export async function generateChannelInsight(recentMetrics: VideoMetrics[]): Promise<ChannelInsight> {
  const avgER = recentMetrics.reduce((sum, m) => sum + calculateEngagementRate(m), 0) / recentMetrics.length

  const userMessage = `Phân tích tổng thể kênh với ${recentMetrics.length} video gần nhất:
Avg Engagement Rate: ${avgER.toFixed(2)}%
Top video (views): ${Math.max(...recentMetrics.map((m) => m.views))}
Total views: ${recentMetrics.reduce((s, m) => s + m.views, 0)}

Output JSON:
{
  "topPerformingSeriesAi": "series đang hoạt động tốt nhất",
  "bestPostingHour": giờ đăng tốt nhất (0-23),
  "avgEngagementRate": ${avgER},
  "recommendations": ["khuyến nghị 1", "khuyến nghị 2", "khuyến nghị 3"],
  "nextContentFocus": ["chủ đề ưu tiên tiếp theo 1", "chủ đề 2"]
}`

  return generateJSON<ChannelInsight>(INSIGHT_SYSTEM_PROMPT, userMessage, { maxTokens: 512 })
}
