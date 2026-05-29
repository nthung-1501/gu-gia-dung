# GU GIA DỤNG — CLAUDE.md

## Project Overview

**GU GIA DỤNG** là hệ thống AI agent tự động hóa toàn bộ pipeline sản xuất content cho kênh TikTok đồ gia dụng.

- **Mục tiêu:** Sản xuất video TikTok chất lượng đều đặn với effort thấp nhất
- **Người dùng:** 1 creator + AI agents (không team)
- **Value proposition:** Build authority nhanh → attract brand deal → không phụ thuộc TikTok Shop

Pipeline: `Sản phẩm → Research → Kịch bản → Video → Publish → Analytics → Loop`

---

## Tech Stack

| Layer | Technology | Lý do chọn |
|-------|-----------|-----------|
| Runtime | Node.js 20 + TypeScript | Type-safe, ecosystem phong phú |
| Framework | Next.js 14 (App Router) | Full-stack, API routes + UI trong 1 |
| Database | PostgreSQL + Drizzle ORM | Relational data, type-safe queries |
| Queue | Redis + BullMQ | Async video jobs, retry logic |
| Automation | n8n | Orchestrate các module, đã có sẵn |
| AI | Claude API (Anthropic SDK) | Kịch bản, caption, analytics |
| Video create | TopView API | Đã có tài khoản |
| Video render | Creatomate API | Đã có tài khoản |
| Deploy | Vercel (web) + Railway (workers) | Serverless + persistent workers |

---

## Folder Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (dashboard)/            # Protected routes
│   │   ├── products/           # Kho sản phẩm
│   │   ├── scripts/            # Quản lý kịch bản
│   │   ├── schedule/           # Lịch đăng bài
│   │   └── analytics/          # Dashboard analytics
│   └── api/                    # API routes
│       ├── research/           # Module 1 endpoints
│       ├── production/         # Module 2 endpoints
│       ├── publish/            # Module 3 endpoints
│       └── analytics/          # Module 4 endpoints
├── modules/
│   ├── research/               # Module 1: Product brief generation
│   ├── production/             # Module 2: Script + video pipeline
│   ├── publish/                # Module 3: Caption + scheduling
│   └── analytics/              # Module 4: Metrics + insights
├── lib/
│   ├── ai/                     # Claude API wrappers
│   ├── db/                     # Drizzle schema + migrations
│   ├── queue/                  # BullMQ job definitions
│   ├── topview/                # TopView API client
│   ├── creatomate/             # Creatomate API client
│   └── tiktok/                 # TikTok API client
└── components/                 # Shared UI components
```

---

## Coding Conventions

- **Language:** TypeScript strict mode (`strict: true`)
- **Naming:** `camelCase` cho variables/functions, `PascalCase` cho components/classes, `UPPER_SNAKE_CASE` cho constants, `kebab-case` cho file names
- **Functions:** Pure functions preferred, async/await (không dùng `.then()`)
- **Imports:** Absolute imports từ `@/` prefix
- **Comments:** Chỉ comment khi logic không tự giải thích được (tiếng Anh)
- **Error handling:** `Result<T, E>` pattern hoặc throw với typed errors tại boundaries

---

## Common Commands

```bash
# Development
npm run dev          # Start Next.js dev server (port 3000)
npm run dev:workers  # Start BullMQ workers

# Code quality
npm run lint         # ESLint
npm run typecheck    # TypeScript check (tsc --noEmit)
npm run test         # Jest unit tests
npm run test:e2e     # Playwright e2e tests

# Database
npm run db:generate  # Generate SQL migration files from schema
npm run db:migrate   # Apply migrations to Supabase
npm run db:push      # Push schema directly (dev shortcut, skips migration files)
npm run db:studio    # Open Drizzle Studio (DB GUI)

# Build & Deploy
npm run build        # Production build
npm run start        # Start production server
```

---

## Verify Loop

**SAU MỖI thay đổi code, BẮT BUỘC chạy theo thứ tự:**

1. `npm run typecheck` — không được có lỗi TypeScript
2. `npm run lint` — không được có lỗi ESLint
3. `npm run test -- --testPathPattern=<file-liên-quan>` — test liên quan phải pass
4. Báo cáo kết quả (✅ hoặc ❌ + lý do) **TRƯỚC KHI** nói "đã xong"

Không bao giờ nói "xong rồi" khi chưa chạy verify loop.

---

## Definition of Done

Một task được coi là **hoàn thành** khi:

- [ ] Code đã viết và logic đúng
- [ ] TypeScript không có lỗi (`typecheck` pass)
- [ ] Lint không có warning/error (`lint` pass)
- [ ] Unit test cho logic mới đã viết và pass
- [ ] Không có `console.log` debug còn sót
- [ ] Không có secrets/hardcoded credentials
- [ ] PR description mô tả rõ what + why

---

## Module Quick Reference

| Module | Input | Output | Key Files |
|--------|-------|--------|-----------|
| Research | Ảnh/link Zalo | Product brief JSON | `src/modules/research/` |
| Production | Product brief | Video file URL | `src/modules/production/` |
| Publish | Video URL | TikTok post scheduled | `src/modules/publish/` |
| Analytics | TikTok metrics | Insights + recommendations | `src/modules/analytics/` |

---

## Environment Variables

Xem `.env.example` (sẽ tạo khi init project). Không bao giờ commit `.env`.

Key vars cần thiết:
- `ANTHROPIC_API_KEY` — Claude API
- `TOPVIEW_API_KEY` — TopView video generation
- `CREATOMATE_API_KEY` — Video rendering
- `CREATOMATE_TEMPLATE_TEST_THAT` — Creatomate template ID cho series Test Thật
- `CREATOMATE_TEMPLATE_HOUSE_30S` — Creatomate template ID cho series Nhà Gọn 30s
- `CREATOMATE_TEMPLATE_WHICH_ONE` — Creatomate template ID cho series Mua Cái Nào
- `TIKTOK_ACCESS_TOKEN` — TikTok API
- `DATABASE_URL` — Supabase PostgreSQL connection string
- `REDIS_URL` — Redis connection string (Upstash, dùng `rediss://`)
