import {
  calculateEngagementRate,
  classifyPerformance,
  generateVideoInsight,
  generateChannelInsight,
} from '../insights'
import * as claude from '@/lib/ai/claude'
import type { VideoMetrics } from '../types'

jest.mock('@/lib/ai/claude')

const mockGenerateJSON = jest.spyOn(claude, 'generateJSON')

const BASE_METRICS: VideoMetrics = {
  tiktokPostId: 'post-001',
  views: 10000,
  likes: 500,
  comments: 80,
  shares: 60,
  saves: 110,
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('calculateEngagementRate', () => {
  it('returns 0 when views is 0', () => {
    expect(calculateEngagementRate({ ...BASE_METRICS, views: 0 })).toBe(0)
  })

  it('calculates (likes + comments + shares + saves) / views * 100', () => {
    // 500 + 80 + 60 + 110 = 750 engagements, 750/10000*100 = 7.5
    expect(calculateEngagementRate(BASE_METRICS)).toBeCloseTo(7.5)
  })

  it('returns correct rate for minimal engagement', () => {
    const metrics: VideoMetrics = { ...BASE_METRICS, likes: 10, comments: 5, shares: 3, saves: 2, views: 1000 }
    // 20/1000*100 = 2
    expect(calculateEngagementRate(metrics)).toBeCloseTo(2)
  })
})

describe('classifyPerformance', () => {
  it('classifies as winner when ER >= 5%', () => {
    // ER = 7.5% → winner
    expect(classifyPerformance(BASE_METRICS)).toBe('winner')
  })

  it('classifies as average when 2% <= ER < 5%', () => {
    // 20 likes, 0 rest, 1000 views → ER = 2%
    const metrics: VideoMetrics = { ...BASE_METRICS, views: 1000, likes: 20, comments: 0, shares: 0, saves: 0 }
    expect(classifyPerformance(metrics)).toBe('average')
  })

  it('classifies as underperformer when ER < 2%', () => {
    // 10 likes, 1000 views → ER = 1%
    const metrics: VideoMetrics = { ...BASE_METRICS, views: 1000, likes: 10, comments: 0, shares: 0, saves: 0 }
    expect(classifyPerformance(metrics)).toBe('underperformer')
  })
})

describe('generateVideoInsight', () => {
  const MOCK_INSIGHT = {
    postId: 'post-001',
    performance: 'winner' as const,
    engagementRate: 7.5,
    retentionScore: 8,
    recommendations: ['Dùng hook mạnh hơn', 'Thêm so sánh giá'],
    topicsToRepeat: ['test thực tế', 'so sánh tầm giá'],
    topicsToAvoid: ['quảng cáo lộ liễu'],
  }

  beforeEach(() => {
    mockGenerateJSON.mockResolvedValue(MOCK_INSIGHT)
  })

  it('calls generateJSON and returns insight', async () => {
    const result = await generateVideoInsight(BASE_METRICS, {
      productName: 'Nồi chiên Xiaomi',
      series: 'test-that',
      hook: 'Chiên không dầu có giòn không?',
    })

    expect(mockGenerateJSON).toHaveBeenCalledTimes(1)
    expect(result).toEqual(MOCK_INSIGHT)
  })

  it('includes product name and hook in the prompt', async () => {
    mockGenerateJSON.mockResolvedValue(MOCK_INSIGHT)

    await generateVideoInsight(BASE_METRICS, {
      productName: 'Máy lọc không khí Xiaomi',
      series: 'house-30s',
      hook: 'Không khí nhà bạn có sạch không?',
    })

    const userMessage = (mockGenerateJSON.mock.calls[0] as string[])[1]
    expect(userMessage).toContain('Máy lọc không khí Xiaomi')
    expect(userMessage).toContain('Không khí nhà bạn có sạch không?')
  })

  it('includes view count in the prompt', async () => {
    mockGenerateJSON.mockResolvedValue(MOCK_INSIGHT)

    await generateVideoInsight({ ...BASE_METRICS, views: 50000 }, {
      productName: 'Test',
      series: 'which-one-better',
      hook: 'Hook test',
    })

    const userMessage = (mockGenerateJSON.mock.calls[0] as string[])[1]
    expect(userMessage).toContain('50000')
  })
})

describe('generateChannelInsight', () => {
  const MOCK_CHANNEL_INSIGHT = {
    topPerformingSeriesAi: 'test-that',
    bestPostingHour: 20,
    avgEngagementRate: 5.2,
    recommendations: ['Tăng tần suất series test-that', 'Đăng thêm lúc 20h', 'Thêm trending sound'],
    nextContentFocus: ['nồi chiên không khí', 'robot hút bụi'],
  }

  beforeEach(() => {
    mockGenerateJSON.mockResolvedValue(MOCK_CHANNEL_INSIGHT)
  })

  it('calls generateJSON with aggregated metrics', async () => {
    const metricsArr: VideoMetrics[] = [
      BASE_METRICS,
      { ...BASE_METRICS, tiktokPostId: 'post-002', views: 5000, likes: 100, comments: 20, shares: 10, saves: 20 },
    ]

    const result = await generateChannelInsight(metricsArr)

    expect(mockGenerateJSON).toHaveBeenCalledTimes(1)
    expect(result).toEqual(MOCK_CHANNEL_INSIGHT)
  })

  it('includes video count in the prompt', async () => {
    const metricsArr: VideoMetrics[] = Array.from({ length: 7 }, (_, i) => ({
      ...BASE_METRICS,
      tiktokPostId: `post-00${i}`,
    }))

    await generateChannelInsight(metricsArr)

    const userMessage = (mockGenerateJSON.mock.calls[0] as string[])[1]
    expect(userMessage).toContain('7')
  })
})
