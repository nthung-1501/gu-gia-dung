# /review — Review code vừa viết

## Mục đích

Review toàn bộ code vừa thay đổi theo checklist chuẩn. Gọi sau khi hoàn thành 1 task hoặc trước khi commit.

## Cách dùng

```
/review                    # Review toàn bộ diff hiện tại
/review src/modules/research/  # Review chỉ 1 module
/review <file-path>        # Review 1 file cụ thể
```

## Checklist

### ✅ Logic & Correctness
- [ ] Logic có đúng với yêu cầu không?
- [ ] Có edge cases nào chưa xử lý?
- [ ] Có off-by-one errors không?
- [ ] Async/await được dùng đúng không (không bỏ sót await)?

### ✅ TypeScript
- [ ] Types có đủ strict không? (tránh `any`)
- [ ] Null/undefined được handle đúng không?
- [ ] Return types được khai báo rõ ràng không?

### ✅ Performance
- [ ] Có N+1 query nào không?
- [ ] Có operation nặng nào nên chạy background job không?
- [ ] Cache có được dùng đúng chỗ không?

### ✅ Security
- [ ] Có input validation tại API boundaries không?
- [ ] Có SQL injection / XSS risk không?
- [ ] Credentials không bị expose ra response không?
- [ ] API endpoints có auth check không?

### ✅ Code Quality
- [ ] Naming có rõ ràng, self-documenting không?
- [ ] Có duplicate code nên extract thành function không?
- [ ] Có `console.log` debug còn sót không?
- [ ] Có hardcoded values nên dùng constants/env không?

### ✅ Tests
- [ ] Happy path đã có test chưa?
- [ ] Error cases đã có test chưa?
- [ ] Test có meaningful (test behavior, không test implementation) không?

## Output format

```
## Review: <tên file/module>

### ❌ Issues cần fix (blocking)
- [file:line] Mô tả vấn đề + cách fix

### ⚠️ Suggestions (non-blocking)
- [file:line] Gợi ý cải thiện

### ✅ LGTM
Những gì đã làm tốt
```

Nếu không có vấn đề gì: output `✅ LGTM — No issues found.`
