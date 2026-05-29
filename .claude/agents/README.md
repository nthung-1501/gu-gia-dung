# Agents

Thư mục này chứa định nghĩa các AI sub-agent chuyên biệt cho từng module.

## Agents dự kiến

| Agent | Module | Nhiệm vụ |
|-------|--------|---------|
| `research-agent.md` | Module 1 | Phân tích ảnh sản phẩm, search thông tin, tạo brief |
| `script-agent.md` | Module 2 | Viết kịch bản TikTok từ brief |
| `caption-agent.md` | Module 3 | Sinh caption + hashtag tối ưu |
| `analytics-agent.md` | Module 4 | Phân tích metrics, tìm pattern winner |

## Cách tạo agent mới

1. Tạo file `<tên-agent>.md` trong thư mục này
2. Định nghĩa role, context, output format
3. Đăng ký trong `.mcp.json` nếu cần tool use
