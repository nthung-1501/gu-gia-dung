import { generateProductBrief } from '../brief-generator'
import * as claude from '@/lib/ai/claude'

jest.mock('@/lib/ai/claude')

const mockGenerateJSON = jest.spyOn(claude, 'generateJSON')
const mockGenerateJSONWithImages = jest.spyOn(claude, 'generateJSONWithImages')

const MOCK_BRIEF = {
  productName: 'Nồi chiên không khí Xiaomi 4L',
  category: 'bếp',
  priceRange: '800.000 - 1.200.000đ',
  keyFeatures: ['Không dầu', 'Công suất 1500W', 'Dung tích 4L'],
  targetAudience: 'Gia đình 3-4 người quan tâm ăn lành mạnh',
  painPoints: ['Đồ chiên dầu không tốt cho sức khỏe', 'Khó vệ sinh nồi dầu', 'Tốn dầu ăn'],
  competitors: ['Philips HD9252', 'Cosori CP158-AF'],
  contentAngles: ['Test chiên gà 15 phút ra sao', 'So sánh với nồi dầu truyền thống', 'Vệ sinh dễ không?'],
  suggestedSeries: ['test-that' as const, 'which-one-better' as const],
  suggestedHooks: ['Tôi ăn sáng bằng cái này 30 ngày', 'Chiên không dầu có giòn thật không?', 'Mua nồi chiên 1 triệu: ngon hay phí tiền?'],
}

beforeEach(() => {
  jest.clearAllMocks()
  mockGenerateJSON.mockResolvedValue(MOCK_BRIEF)
  mockGenerateJSONWithImages.mockResolvedValue(MOCK_BRIEF)
})

describe('generateProductBrief', () => {
  it('calls generateJSON when no images provided', async () => {
    const result = await generateProductBrief({ name: 'Nồi chiên Xiaomi' })

    expect(mockGenerateJSON).toHaveBeenCalledTimes(1)
    expect(mockGenerateJSONWithImages).not.toHaveBeenCalled()
    expect(result).toEqual(MOCK_BRIEF)
  })

  it('calls generateJSONWithImages when imageBase64s present', async () => {
    const fakeBase64 = 'data:image/jpeg;base64,/9j/fake'
    const result = await generateProductBrief({
      name: 'Nồi chiên Xiaomi',
      imageBase64s: [fakeBase64],
    })

    expect(mockGenerateJSONWithImages).toHaveBeenCalledTimes(1)
    expect(mockGenerateJSONWithImages).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('1 ảnh đính kèm'),
      [fakeBase64],
      expect.any(Object)
    )
    expect(mockGenerateJSON).not.toHaveBeenCalled()
    expect(result).toEqual(MOCK_BRIEF)
  })

  it('includes name in user message', async () => {
    await generateProductBrief({ name: 'Robot hút bụi Dreame' })

    expect(mockGenerateJSON).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('Robot hút bụi Dreame'),
      expect.any(Object)
    )
  })

  it('includes optional fields when provided', async () => {
    await generateProductBrief({
      name: 'Test',
      description: 'mô tả test',
      priceRange: '500.000đ',
    })

    const userMessage = (mockGenerateJSON.mock.calls[0] as string[])[1]
    expect(userMessage).toContain('mô tả test')
    expect(userMessage).toContain('500.000đ')
  })
})
