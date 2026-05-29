# Skills

Thư mục này chứa các reusable skill cho Claude Code trong project này.

## Skills dự kiến

| Skill | Mô tả |
|-------|-------|
| `generate-brief` | Từ ảnh/link → tạo product brief đầy đủ |
| `write-script` | Từ brief → kịch bản TikTok theo format chuẩn |
| `render-video` | Gọi Creatomate API để render video |
| `schedule-post` | Lên lịch đăng TikTok theo giờ peak |
| `pull-analytics` | Kéo metrics từ TikTok Analytics API |

## Cách tạo skill mới

1. Tạo file `<tên-skill>.md` trong thư mục này
2. Viết system prompt + input/output spec
3. Test với `/skill <tên-skill>`
