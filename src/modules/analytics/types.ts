export type VideoMetrics = {
  tiktokPostId: string
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  avgWatchTime?: number
  completionRate?: number
}

export type VideoInsight = {
  postId: string
  performance: 'winner' | 'average' | 'underperformer'
  engagementRate: number
  retentionScore: number
  recommendations: string[]
  topicsToRepeat: string[]
  topicsToAvoid: string[]
}

export type ChannelInsight = {
  topPerformingSeriesAi: string
  bestPostingHour: number
  avgEngagementRate: number
  recommendations: string[]
  nextContentFocus: string[]
}
