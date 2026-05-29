import { generateJSON, generateJSONWithImages } from '@/lib/ai/claude'
import type { ProductBrief } from '@/lib/db/schema'
import type { ResearchInput } from './types'

const SYSTEM_PROMPT = `Bạn là chuyên gia content TikTok chuyên về đồ gia dụng Việt Nam.
Kênh "Gu Gia Dụng" có phong cách: thành thật, không nói quá, review thực tế, target người dùng 25-40 tuổi quan tâm đến tổ ấm.

Series của kênh:
- "test-that": Test thực tế sản phẩm, so sánh với quảng cáo
- "house-30s": Tip dọn nhà/sắp xếp nhanh trong 30 giây
- "which-one-better": So sánh 2 sản phẩm cùng tầm giá

Tạo product brief JSON để chuẩn bị content TikTok.`

const BRIEF_SCHEMA = `{
  "productName": "tên đầy đủ",
  "category": "danh mục (bếp/dọn nhà/tiện ích/phòng ngủ/...)",
  "priceRange": "khoảng giá ước tính",
  "keyFeatures": ["tính năng 1", "tính năng 2", ...] (tối đa 5),
  "targetAudience": "mô tả đối tượng mục tiêu",
  "painPoints": ["vấn đề 1", "vấn đề 2", "vấn đề 3"] (tối đa 3),
  "competitors": ["sản phẩm tương tự 1", "sản phẩm tương tự 2"],
  "contentAngles": ["góc content 1", "góc content 2", "góc content 3"],
  "suggestedSeries": ["test-that", "which-one-better"],
  "suggestedHooks": ["hook 1 (dưới 3 giây)", "hook 2 (dưới 3 giây)", "hook 3 (dưới 3 giây)"]
}`

export async function generateProductBrief(input: ResearchInput): Promise<ProductBrief> {
  const userMessage = `Sản phẩm: ${input.name}
${input.description ? `Mô tả: ${input.description}` : ''}
${input.priceRange ? `Tầm giá: ${input.priceRange}` : ''}
${input.sourceUrl ? `Link nguồn: ${input.sourceUrl}` : ''}
${input.imageBase64s?.length ? `(Có ${input.imageBase64s.length} ảnh đính kèm — phân tích ảnh để bổ sung thông tin sản phẩm)` : ''}

Tạo brief JSON với cấu trúc:
${BRIEF_SCHEMA}`

  if (input.imageBase64s && input.imageBase64s.length > 0) {
    return generateJSONWithImages<ProductBrief>(SYSTEM_PROMPT, userMessage, input.imageBase64s, { maxTokens: 1024 })
  }

  return generateJSON<ProductBrief>(SYSTEM_PROMPT, userMessage, { maxTokens: 1024 })
}
