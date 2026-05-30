import { generateJSON } from '@/lib/ai/claude'
import type { ProductBrief } from '@/lib/db/schema'

type CommentResponseInput = {
  commenterUsername: string
  commentText: string
  productName: string
  productBrief: ProductBrief
  originalHook: string
}

type CommentResponseScript = {
  series: 'test-that' | 'house-30s' | 'which-one-better'
  hook: string
  body: string
  cta: string
  estimatedDuration: number
  shotNotes: string
}

const SYSTEM_PROMPT = `Bạn là scriptwriter TikTok cho kênh "Gu Gia Dụng" — chia sẻ trải nghiệm đồ gia dụng.

Phong cách:
- Giọng chia sẻ khách quan như bạn bè, không quảng cáo, không PR
- Dùng từ ngữ thực tế: "theo mình", "mình thử thấy", "thực ra là...", "nếu bạn hỏi mình thì..."
- Nhắc tên người comment tự nhiên ngay đầu video, không gượng gạo
- Mở rộng góc nhìn từ câu hỏi — đừng chỉ trả lời thẳng, hãy chia sẻ thêm điều audience chưa nghĩ tới

Visual style (KHÔNG lộ mặt):
- Chỉ có tay cầm/thao tác sản phẩm, không quay mặt người
- Camera tập trung vào sản phẩm đang hoạt động, chi tiết bề mặt, kết quả thực tế
- Góc quay: overhead, close-up chi tiết, side view khi thao tác

Series và shot style:
- "test-that": Tay cầm → Close-up chi tiết → Dùng thực tế → Kết quả trước/sau (~60s)
- "house-30s": Close-up sản phẩm → Tay thao tác nhanh → Kết quả ngay (~30s)
- "which-one-better": 2 sản phẩm cạnh nhau → Tay chỉ điểm khác biệt → Test song song (~90s)

Chọn series phù hợp: hỏi cách dùng → house-30s | hỏi đáng mua không → test-that | hỏi so sánh → which-one-better.`

export async function generateCommentResponse(input: CommentResponseInput): Promise<CommentResponseScript> {
  const userMessage = `Có người comment vào video "${input.originalHook}" về sản phẩm "${input.productName}":

@${input.commenterUsername}: "${input.commentText}"

Thông tin sản phẩm:
- Đối tượng: ${input.productBrief.targetAudience}
- Tính năng: ${input.productBrief.keyFeatures.join(', ')}
- Pain points: ${input.productBrief.painPoints.join(', ')}

Tạo video mới phản hồi comment này:
- Nhắc tên @${input.commenterUsername} tự nhiên trong hook hoặc đầu body
- Mở rộng góc nhìn từ câu hỏi/chia sẻ của họ
- Giọng khách quan, dùng từ chia sẻ như bạn bè — không quảng cáo
- Chọn series phù hợp nhất

Output JSON:
{
  "series": "test-that" | "house-30s" | "which-one-better",
  "hook": "câu mở đầu 3 giây tạo tò mò hoặc nêu vấn đề",
  "body": "nội dung chính, viết liền mạch như thoại tự nhiên",
  "cta": "kêu gọi hành động ngắn, không ép buộc",
  "estimatedDuration": số giây ước tính,
  "shotNotes": "mô tả từng cảnh quay theo thứ tự: [Cảnh 1] ... [Cảnh 2] ... — chỉ tay và sản phẩm, không mặt người"
}`

  return generateJSON<CommentResponseScript>(SYSTEM_PROMPT, userMessage, { maxTokens: 1024 })
}
