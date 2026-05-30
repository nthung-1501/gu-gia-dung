import { startVideoPipeline } from '../video-pipeline'
import * as creatomate from '@/lib/creatomate/client'

jest.mock('@/lib/creatomate/client')

const mockRender = jest.spyOn(creatomate.creatomateClient, 'render')

beforeEach(() => {
  jest.clearAllMocks()
  mockRender.mockResolvedValue([{ id: 'creatomate-job-123', status: 'planned' }] as never)
})

const INPUT = {
  videoId: 'video-uuid-1',
  scriptId: 'script-uuid-1',
  series: 'test-that',
  productName: 'Nồi chiên Xiaomi',
  hook: 'Chiên không dầu có giòn không?',
  productImageUrl: 'https://example.com/product.jpg',
}

describe('startVideoPipeline', () => {
  it('calls Creatomate and returns submitted status with jobId', async () => {
    const result = await startVideoPipeline(INPUT)

    expect(mockRender).toHaveBeenCalledWith(expect.objectContaining({
      modifications: expect.objectContaining({
        'Video-FP8': INPUT.productImageUrl,
        'hook-text': INPUT.hook,
        'product-name': INPUT.productName,
      }),
    }))
    expect(result.status).toBe('submitted')
    expect(result.creatomateJobId).toBe('creatomate-job-123')
  })

  it('returns failed status when Creatomate throws', async () => {
    mockRender.mockRejectedValue(new Error('Creatomate API error'))

    const result = await startVideoPipeline(INPUT)

    expect(result.status).toBe('failed')
    expect(result.creatomateJobId).toBe('')
    expect(result.error).toContain('Creatomate API error')
  })
})
