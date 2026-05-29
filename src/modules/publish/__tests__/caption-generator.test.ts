import { generateCaption } from '../caption-generator'
import * as claude from '@/lib/ai/claude'

jest.mock('@/lib/ai/claude')

const mockGenerateJSON = jest.spyOn(claude, 'generateJSON')

const MOCK_CAPTION = {
  caption: 'Nồi chiên 1 triệu đáng mua không? Test thật đây 👇',
  hashtags: ['#gugiaiung', '#dogiadung', '#reviewdogiadung', '#homehacks', '#noichienkkhongkhi', '#xuhuong', '#tiktokvietnam', '#foryou'],
}

beforeEach(() => {
  jest.clearAllMocks()
  mockGenerateJSON.mockResolvedValue(MOCK_CAPTION)
})

describe('generateCaption', () => {
  it('calls generateJSON and returns caption', async () => {
    const result = await generateCaption({
      productName: 'Nồi chiên Xiaomi 4L',
      series: 'test-that',
      hook: 'Chiên không dầu có giòn thật không?',
      verdict: 'Đáng mua cho gia đình 3-4 người',
    })

    expect(mockGenerateJSON).toHaveBeenCalledTimes(1)
    expect(result).toEqual(MOCK_CAPTION)
  })

  it('includes product name in user message', async () => {
    await generateCaption({
      productName: 'Robot hút bụi Dreame L10',
      series: 'test-that',
      hook: 'Hút bụi tự động có sạch thật không?',
      verdict: 'Tốt cho nhà dưới 60m2',
    })

    const userMessage = (mockGenerateJSON.mock.calls[0] as string[])[1]
    expect(userMessage).toContain('Robot hút bụi Dreame L10')
  })

  it('includes hook in user message', async () => {
    await generateCaption({
      productName: 'Máy xay sinh tố',
      series: 'house-30s',
      hook: 'Xay xong trong 30 giây',
      verdict: 'Dùng được',
    })

    const userMessage = (mockGenerateJSON.mock.calls[0] as string[])[1]
    expect(userMessage).toContain('Xay xong trong 30 giây')
  })

  it('includes price range when provided', async () => {
    await generateCaption({
      productName: 'Dao thái inox',
      series: 'which-one-better',
      hook: '200k vs 800k khác nhau thế nào?',
      verdict: 'Loại 500k là sweet spot',
      priceRange: '200.000 - 800.000đ',
    })

    const userMessage = (mockGenerateJSON.mock.calls[0] as string[])[1]
    expect(userMessage).toContain('200.000 - 800.000đ')
  })

  it('omits price section when priceRange is undefined', async () => {
    await generateCaption({
      productName: 'Hộp đựng thức ăn',
      series: 'house-30s',
      hook: 'Sắp xếp tủ lạnh trong 30s',
      verdict: 'Nên mua',
    })

    const userMessage = (mockGenerateJSON.mock.calls[0] as string[])[1]
    expect(userMessage).not.toContain('Giá:')
  })
})
