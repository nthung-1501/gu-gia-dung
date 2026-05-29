# Hooks

Thư mục này chứa các hook tự động chạy khi Claude thực hiện các hành động nhất định.

## Hooks dự kiến

| Hook | Trigger | Hành động |
|------|---------|----------|
| `pre-commit` | Trước khi commit | Kiểm tra không có `.env` hoặc secrets |
| `post-edit` | Sau khi sửa file | Chạy lint tự động |
| `post-deploy` | Sau khi deploy | Gửi thông báo Slack/Telegram |

## Cấu hình hook

Hooks được cấu hình trong `.claude/settings.json`. Xem hướng dẫn tại:
`/update-config` skill hoặc Claude Code documentation.
