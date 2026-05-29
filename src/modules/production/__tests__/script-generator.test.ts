import { generateScript } from '../script-generator'
import * as claude from '@/lib/ai/claude'

jest.mock('@/lib/ai/claude')

const mockGenerateJSON = jest.spyOn(claude, 'generateJSON')

const MOCK_SCRIPT = {
  hook: 'Chiên không dầu có giòn thật không?',
  body: 'Tôi dùng nồi chiên Xiaomi 4L trong 2 tuần...',
  cta: 'Xem review đầy đủ trong bio',
  estimatedDuration: 60,
  series: 'test-that' as const,
}

beforeEach(() => {
  jest.clearAllMocks()
  mockGenerateJSON.mockResolvedValue(MOCK_SCRIPT)
})

describe('generateScript', () => {
  it('calls generateJSON and returns script', async () => {
    const result = await generateScript({
      productId: 'uuid-1',
      series: 'test-that',
      productName: 'Nồi chiên Xiaomi 4L',
      keyFeatures: ['Không dầu', 'Công suất 1500W'],
      painPoints: ['Đồ chiên dầu không tốt cho sức khỏe'],
    })

    expect(mockGenerateJSON).toHaveBeenCalledTimes(1)
    expect(result).toEqual(MOCK_SCRIPT)
  })

  it('includes product name in user message', async () => {
    await generateScript({
      productId: 'uuid-1',
      series: 'test-that',
      productName: 'Robot hút bụi Dreame',
      keyFeatures: ['Tự động'],
      painPoints: ['Tốn công dọn'],
    })

    const userMessage = (mockGenerateJSON.mock.calls[0] as string[])[1]
    expect(userMessage).toContain('Robot hút bụi Dreame')
  })

  it('includes series in user message', async () => {
    await generateScript({
      productId: 'uuid-1',
      series: 'house-30s',
      productName: 'Cọ nhà vệ sinh',
      keyFeatures: ['Đầu thay được'],
      painPoints: ['Hôi tay'],
    })

    const userMessage = (mockGenerateJSON.mock.calls[0] as string[])[1]
    expect(userMessage).toContain('house-30s')
  })

  it('uses default duration per series when targetDuration is omitted', async () => {
    await generateScript({
      productId: 'uuid-1',
      series: 'house-30s',
      productName: 'Móc treo tường',
      keyFeatures: ['Dán không khoan'],
      painPoints: ['Khoan tường rách vôi'],
    })

    const userMessage = (mockGenerateJSON.mock.calls[0] as string[])[1]
    expect(userMessage).toContain('30')
  })

  it('uses custom targetDuration when provided', async () => {
    await generateScript({
      productId: 'uuid-1',
      series: 'which-one-better',
      productName: 'Nồi cơm điện',
      keyFeatures: ['Giữ ấm'],
      painPoints: ['Tốn điện'],
      targetDuration: 45,
    })

    const userMessage = (mockGenerateJSON.mock.calls[0] as string[])[1]
    expect(userMessage).toContain('45')
  })

  it('includes suggested hook when provided', async () => {
    await generateScript({
      productId: 'uuid-1',
      series: 'test-that',
      productName: 'Máy xay sinh tố',
      keyFeatures: ['700W'],
      painPoints: ['Ồn'],
      suggestedHook: 'Xay sinh tố mà không ồn có được không?',
    })

    const userMessage = (mockGenerateJSON.mock.calls[0] as string[])[1]
    expect(userMessage).toContain('Xay sinh tố mà không ồn có được không?')
  })
})
