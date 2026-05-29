# Decisions Log

<!-- Được cập nhật bởi /clear-context mỗi khi kết thúc session làm việc -->

| Ngày | Quyết định | Lý do |
|------|-----------|-------|
| 2026-05-29 | Khởi tạo project scaffold | Setup cấu trúc ban đầu cho hệ thống AI agent 4 module |
| 2026-05-29 | Tech stack chọn: Next.js 14 + TS + PostgreSQL/Drizzle + Redis/BullMQ + n8n | Full-stack trong 1 repo, type-safe, phù hợp pipeline async video |
| 2026-05-29 | Tạo 3 slash commands: /plan, /review, /clear-context | Chuẩn hóa workflow làm việc với Claude |
| 2026-05-29 | Fix `next.config.mjs`: đổi `serverExternalPackages` → `experimental.serverComponentsExternalPackages` | Key cũ là Next.js 15, project dùng Next.js 14 |
| 2026-05-29 | Thêm `export const dynamic = 'force-dynamic'` vào 6 dashboard pages | Next.js cố prerender pages có DB query ở build time → authentication error; force-dynamic đưa về server-render on demand |
| 2026-05-29 | Thêm `force-dynamic` vào `products/[id]/page.tsx` và `scripts/[id]/page.tsx` | Các detail page cũng query DB nhưng bị bỏ sót trong lần đầu; cùng lý do với 6 trang đã fix |
| 2026-05-29 | Thêm unit tests cho 3 module mới: production/script-generator, publish/caption-generator, publish/scheduler | Đưa coverage lên 5 test suites / 31 tests; scheduler test cần include giờ 10 (Sat/Sun) trong PEAK_HOURS |
