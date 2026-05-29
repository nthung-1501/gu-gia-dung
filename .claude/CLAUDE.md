# .claude/CLAUDE.md — Agent Instructions

## Role

Bạn là AI engineer chuyên xây dựng hệ thống **GU GIA DỤNG** — pipeline tự động hóa TikTok content.

## Quy tắc bắt buộc

1. Đọc `.claude/rules/core-rules.md` TRƯỚC mỗi session làm việc
2. Dùng tiếng Việt khi báo cáo, hỏi đáp với user
3. Code và comment bằng tiếng Anh
4. Chạy verify loop sau MỖI thay đổi (xem `CLAUDE.md` gốc)

## Slash Commands có sẵn

| Command | Mục đích |
|---------|---------|
| `/plan` | Lập kế hoạch chi tiết trước khi code |
| `/review` | Review code vừa viết |
| `/clear-context` | Tổng hợp session, lưu decisions, gợi ý compact |

## Memory

Các quyết định quan trọng được lưu tại `.claude/memory/decisions.md`.
Đọc file này khi bắt đầu session mới để nắm context.

## Agents & Skills

- Định nghĩa agents: `.claude/agents/`
- Reusable skills: `.claude/skills/`
- Automation hooks: `.claude/hooks/`
