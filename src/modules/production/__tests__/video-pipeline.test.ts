import { startVideoPipeline } from '../video-pipeline'
import * as topview from '@/lib/topview/client'
import * as queue from '@/lib/queue'

jest.mock('@/lib/topview/client')
jest.mock('@/lib/queue')

const mockCreateVideo = jest.spyOn(topview.topviewClient, 'createVideo')
const mockQueueAdd = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  ;(queue.productionQueue as unknown as { add: jest.Mock }).add = mockQueueAdd
  mockCreateVideo.mockResolvedValue({
    jobId: 'topview-job-123',
    status: 'pending',
  })
  mockQueueAdd.mockResolvedValue(undefined)
})

const INPUT = {
  videoId: 'video-uuid-1',
  scriptId: 'script-uuid-1',
  scriptText: 'Hook\n\nBody\n\nCTA',
  series: 'test-that',
  productName: 'Nồi chiên Xiaomi',
  hook: 'Chiên không dầu có giòn không?',
}

describe('startVideoPipeline', () => {
  it('calls TopView and returns submitted status with jobId', async () => {
    const result = await startVideoPipeline(INPUT)

    expect(mockCreateVideo).toHaveBeenCalledWith({
      scriptText: INPUT.scriptText,
      aspectRatio: '9:16',
    })
    expect(result.status).toBe('submitted')
    expect(result.topviewJobId).toBe('topview-job-123')
  })

  it('enqueues production queue job after TopView submission', async () => {
    await startVideoPipeline(INPUT)

    expect(mockQueueAdd).toHaveBeenCalledWith(
      'poll-topview',
      { videoId: INPUT.videoId, scriptId: INPUT.scriptId },
      expect.objectContaining({ delay: 30_000, attempts: 20 })
    )
  })

  it('returns failed status and empty jobId when TopView throws', async () => {
    mockCreateVideo.mockRejectedValue(new Error('TopView API error 500: Internal error'))

    const result = await startVideoPipeline(INPUT)

    expect(result.status).toBe('failed')
    expect(result.topviewJobId).toBe('')
    expect(result.error).toContain('TopView API error')
  })

  it('does not enqueue when TopView fails', async () => {
    mockCreateVideo.mockRejectedValue(new Error('Network error'))

    await startVideoPipeline(INPUT)

    expect(mockQueueAdd).not.toHaveBeenCalled()
  })
})
