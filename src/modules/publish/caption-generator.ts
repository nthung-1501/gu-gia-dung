import { generateJSON } from '@/lib/ai/claude'
import type { CaptionInput, GeneratedCaption } from './types'

const SYSTEM_PROMPT = `Bạn là social media manager cho kênh TikTok "Gu Gia Dụng" — review đồ gia dụng.

Quy tắc caption:
- Ngắn gọn, không quá 150 ký tự (trừ hashtag)
- Tạo tò mò hoặc nêu thẳng kết luận
- Không dùng emoji quá nhiều (tối đa 2-3)
- Hashtag: mix trending + niche (tổng 8-12 hashtag)
- Hashtags niche kênh: #gugiaiung #dogiadung #reviewdogiadung #homehacks
- Hashtags trending VN: #xuhuong #tiktokvietnam #foryou`

export async function generateCaption(input: CaptionInput): Promise<GeneratedCaption> {
  const userMessage = `Tạo caption cho video TikTok:
Sản phẩm: ${input.productName}
Series: ${input.series}
Hook video: ${input.hook}
Kết luận: ${input.verdict}
${input.priceRange ? `Giá: ${input.priceRange}` : ''}

Output JSON:
{
  "caption": "nội dung caption (không bao gồm hashtag)",
  "hashtags": ["#hashtag1", "#hashtag2", ...] (8-12 hashtag)
}`

  return generateJSON<GeneratedCaption>(SYSTEM_PROMPT, userMessage, { maxTokens: 512 })
}
