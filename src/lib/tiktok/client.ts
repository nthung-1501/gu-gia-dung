const BASE_URL = 'https://open.tiktokapis.com/v2'

type TikTokPost = {
  publish_id: string
}

type TikTokApiResponse<T> = {
  data: T
  error: {
    code: string
    message: string
    log_id: string
  }
}

type TikTokMetricsResponse = {
  videos: Array<{
    id: string
    view_count: number
    like_count: number
    comment_count: number
    share_count: number
    collect_count: number
    average_time_watched: number
    full_video_watched_rate: number
  }>
}

export type TikTokMetrics = {
  post_id: string
  view_count: number
  like_count: number
  comment_count: number
  share_count: number
  collect_count: number
  average_time_watched: number
  full_video_watched_rate: number
}

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`TikTok API error ${res.status}: ${body}`)
  }

  const json = await res.json() as TikTokApiResponse<T>

  if (json.error?.code && json.error.code !== 'ok') {
    throw new Error(`TikTok API error: ${json.error.message} (${json.error.code})`)
  }

  return json.data
}

export const tiktokClient = {
  // Posts video by pulling from a URL (no file upload needed — works with TopView/Creatomate URLs)
  async schedulePost(params: {
    videoUrl: string
    caption: string
    scheduledAt: Date
  }): Promise<TikTokPost> {
    const scheduledTimestamp = Math.floor(params.scheduledAt.getTime() / 1000)

    return request<TikTokPost>('/post/publish/video/init/', {
      method: 'POST',
      body: JSON.stringify({
        post_info: {
          title: params.caption,
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          scheduled_publish_time: scheduledTimestamp,
        },
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: params.videoUrl,
        },
      }),
    })
  },

  async getVideoMetrics(postId: string): Promise<TikTokMetrics> {
    const data = await request<TikTokMetricsResponse>(
      '/research/video/query/?fields=view_count,like_count,comment_count,share_count,collect_count,average_time_watched,full_video_watched_rate',
      {
        method: 'POST',
        body: JSON.stringify({
          filters: { video_ids: [postId] },
          max_count: 1,
          cursor: 0,
        }),
      }
    )

    const video = data.videos?.[0]
    if (!video) throw new Error(`TikTok metrics not found for post ${postId}`)

    return {
      post_id: postId,
      view_count: video.view_count,
      like_count: video.like_count,
      comment_count: video.comment_count,
      share_count: video.share_count,
      collect_count: video.collect_count,
      average_time_watched: video.average_time_watched,
      full_video_watched_rate: video.full_video_watched_rate,
    }
  },
}
