# GU GIA DỤNG — Ý Tưởng Dự Án

## Tổng quan

Kênh TikTok chuyên đồ gia dụng **GU GIA DỤNG**. Không TikTok Shop. Monetize qua **brand deal trực tiếp**.

## Góc nội dung

- Test thực tế sản phẩm
- So sánh tầm giá (budget vs premium)
- Cảnh báo người mua (sản phẩm kém chất lượng)

## Cấu trúc video

| Loại | Thời lượng | Cấu trúc |
|------|-----------|-----------|
| Giới thiệu sản phẩm | 30–60s | Hook 3s → Vấn đề → Demo → Kết luận → CTA |
| Test / So sánh | 90–120s | Hook 3s → Vấn đề → Test chi tiết → Kết quả → CTA |

## Hệ thống AI Agent — 4 Module

### Module 1 — Research
- **Input A:** User upload ảnh + mô tả sản phẩm → Claude search thêm thông tin → tạo brief đầy đủ
- **Input B:** Link Zalo bài viết → kéo thông tin sản phẩm tự động
- **Output:** Product brief chuẩn hóa sẵn sàng cho production

### Module 2 — Production
- Claude viết kịch bản từ brief (hook, body, CTA)
- TopView tạo video raw (đã có tài khoản)
- Creatomate ghép, chèn text, render video thành phẩm

### Module 3 — Publish
- Kỹ thuật trending sound: tìm video viral TikTok → lấy âm thanh gốc → giảm volume → làm nhạc nền
- Claude sinh caption + hashtag tối ưu
- Lên lịch đăng theo giờ peak (auto-schedule)

### Module 4 — Analytics
- Kéo metrics từ TikTok Analytics API (views, likes, shares, saves, watch time)
- Claude phân tích pattern, tìm video winner
- Feed ngược về Module 1 để ưu tiên topic/angle đang win

## Chiến lược

- Build authority trước (6 tháng đầu), brand deal sau
- Không phụ thuộc TikTok Shop — độc lập với algorithm shopping
- Pipeline tự động end-to-end giúp đăng đều đặn với effort thấp

## Tools hiện có

- **TopView** — tạo video AI
- **Creatomate** — render & ghép video
- **n8n** — workflow automation
- **Claude API** — AI backbone

## Cần build thêm

1. Kho sản phẩm (product database)
2. Pipeline kịch bản tự động
3. Publish scheduler tích hợp TikTok
4. Analytics dashboard
