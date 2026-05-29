# /clear-context — Tổng hợp session & chuẩn bị compact

## Mục đích

Dùng khi context window sắp đầy hoặc khi kết thúc 1 session làm việc. Tổng hợp những gì đã làm, lưu vào memory, rồi gợi ý /compact để bắt đầu session mới sạch sẽ.

## Các bước thực hiện

### Bước 1 — Tóm tắt session

Output một đoạn ngắn gọn:

```
## Session Summary — [Ngày giờ]

### Đã làm
- [Task 1]: Mô tả ngắn + trạng thái (✅ xong / 🔄 đang dở / ❌ bỏ)
- [Task 2]: ...

### Quyết định quan trọng
- Quyết định gì? Lý do là gì?

### Còn dở
- Việc gì chưa xong? Context cần biết để tiếp tục?

### Files đã thay đổi
- `path/to/file` — thay đổi gì
```

### Bước 2 — Lưu vào decisions.md

Append những quyết định quan trọng (không phải chi tiết implement) vào `.claude/memory/decisions.md`:

```markdown
| [Ngày] | [Quyết định ngắn gọn] | [Lý do] |
```

Chỉ lưu quyết định có tính lâu dài, không lưu chi tiết tạm thời.

### Bước 3 — Gợi ý

Output:
```
✅ Context đã được tổng hợp và lưu vào .claude/memory/decisions.md

💡 Gợi ý: Gõ /compact để nén context và bắt đầu session mới.
   Session mới sẽ đọc decisions.md để tiếp tục từ đúng chỗ.
```

## Lưu ý

- Không xóa gì trong session — chỉ tổng hợp và lưu
- Nếu có task đang dở, ghi rõ context đủ để tiếp tục mà không cần đọc lại toàn bộ conversation
