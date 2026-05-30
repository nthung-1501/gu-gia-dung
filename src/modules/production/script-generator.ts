import { generateJSON } from '@/lib/ai/claude'
import type { ScriptInput, GeneratedScript } from './types'

const SYSTEM_PROMPT = `Bạn là scriptwriter TikTok cho kênh "Gu Gia Dụng" — review đồ gia dụng.

Phong cách kênh:
- Thành thật, không nói quá, không dùng từ ngữ marketing rẻ tiền
- Giọng bạn bè, gần gũi, thực tế
- Số liệu cụ thể khi có thể (giá, kích thước, thời gian)
- Kết luận rõ ràng: đáng mua hay không, cho ai

Visual style (KHÔNG lộ mặt — camera chỉ quay sản phẩm):
- Chỉ có tay cầm/thao tác sản phẩm, không quay mặt người
- Camera tập trung vào sản phẩm đang hoạt động, chi tiết bề mặt, kết quả
- Góc quay: overhead (nhìn từ trên), close-up chi tiết, side view khi dùng

Shot notes theo series:
- "test-that": Tay cầm sản phẩm → Close-up chi tiết cấu tạo → Cảnh dùng thực tế (tay thao tác) → Kết quả trước/sau → Tay giữ sản phẩm kết luận
- "house-30s": Close-up sản phẩm → Tay thao tác nhanh → Kết quả ngay lập tức → Text overlay tip
- "which-one-better": 2 sản phẩm đặt cạnh nhau → Tay chỉ từng điểm khác biệt → Test song song → Tay chọn 1 cái

Cấu trúc theo series:
- "test-that": Hook vấn đề → Test thực tế → Kết quả so với quảng cáo → Verdict
- "house-30s": Hook nhanh → Tip/trick ngắn → Kết quả → CTA xem thêm
- "which-one-better": Hook so sánh → Test cả hai → Điểm khác biệt → Nên chọn cái nào`

const DURATION_BY_SERIES: Record<string, number> = {
  'test-that': 60,
  'house-30s': 30,
  'which-one-better': 90,
}

export async function generateScript(input: ScriptInput): Promise<GeneratedScript> {
  const targetDuration = input.targetDuration ?? DURATION_BY_SERIES[input.series]

  const userMessage = `Viết kịch bản TikTok cho:
Sản phẩm: ${input.productName}
Series: ${input.series}
Thời lượng mục tiêu: ~${targetDuration} giây
Tính năng chính: ${input.keyFeatures.join(', ')}
Pain points: ${input.painPoints.join(', ')}
${input.suggestedHook ? `Hook gợi ý: ${input.suggestedHook}` : ''}

Output JSON:
{
  "hook": "câu mở đầu 3 giây (tạo tò mò hoặc nêu vấn đề)",
  "body": "nội dung chính (demo/test/so sánh), viết liền mạch như thoại tự nhiên",
  "cta": "kêu gọi hành động ngắn gọn, không ép buộc",
  "estimatedDuration": số giây ước tính,
  "series": "${input.series}",
  "shotNotes": "mô tả từng cảnh quay cụ thể theo thứ tự: [Cảnh 1] ... [Cảnh 2] ... — chỉ tay và sản phẩm, không mặt người"
}`

  return generateJSON<GeneratedScript>(SYSTEM_PROMPT, userMessage, { maxTokens: 1024 })
}
