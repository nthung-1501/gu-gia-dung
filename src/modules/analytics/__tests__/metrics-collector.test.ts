import { collectMetrics } from '../metrics-collector'
import * as tiktok from '@/lib/tiktok/client'

jest.mock('@/lib/tiktok/client')
jest.mock('@/lib/db', () => ({
  db: {
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockResolvedValue([]),
    }),
  },
  analyticsSnapshots: {},
}))

const mockGetVideoMetrics = jest.spyOn(tiktok.tiktokClient, 'getVideoMetrics')

const MOCK_RAW = {
  post_id: 'post-abc',
  view_count: 20000,
  like_count: 800,
  comment_count: 120,
  share_count: 90,
  collect_count: 200,
  average_time_watched: 18.5,
  full_video_watched_rate: 0.42,
}

beforeEach(() => {
  jest.clearAllMocks()
  mockGetVideoMetrics.mockResolvedValue(MOCK_RAW)
})

describe('collectMetrics', () => {
  it('calls tiktokClient.getVideoMetrics with the given postId', async () => {
    await collectMetrics('job-uuid-1', 'post-abc')

    expect(mockGetVideoMetrics).toHaveBeenCalledWith('post-abc')
  })

  it('maps raw TikTok response to VideoMetrics shape', async () => {
    const result = await collectMetrics('job-uuid-1', 'post-abc')

    expect(result).toEqual({
      tiktokPostId: 'post-abc',
      views: 20000,
      likes: 800,
      comments: 120,
      shares: 90,
      saves: 200,
      avgWatchTime: 18.5,
      completionRate: 0.42,
    })
  })

  it('persists snapshot to DB via db.insert', async () => {
    const { db } = await import('@/lib/db')

    await collectMetrics('job-uuid-2', 'post-abc')

    expect(db.insert).toHaveBeenCalledTimes(1)
  })

  it('throws when tiktokClient.getVideoMetrics throws', async () => {
    mockGetVideoMetrics.mockRejectedValue(new Error('TikTok API error 401: Unauthorized'))

    await expect(collectMetrics('job-uuid-1', 'post-xyz')).rejects.toThrow('TikTok API error')
  })
})
