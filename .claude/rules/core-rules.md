# Core Rules — GU GIA DỤNG

Các quy tắc này có hiệu lực trong MỌI session. Không được bỏ qua.

---

## 🔒 Bảo mật

- **KHÔNG BAO GIỜ** commit file `.env`, `.env.*`, hoặc bất kỳ file nào chứa API keys, tokens, passwords, secrets
- **KHÔNG BAO GIỜ** hardcode credentials trong source code
- Nếu phát hiện credentials trong code, cảnh báo ngay lập tức và hướng dẫn rotate key
- Trước khi commit, luôn kiểm tra `git diff --staged` xem có secrets không

## 🗑️ File Safety

- **KHÔNG XÓA** file hoặc folder nếu chưa hỏi và được user xác nhận
- Khi cần xóa: nêu rõ lý do + hỏi user trước khi thực hiện
- Với destructive operations (reset --hard, rm -rf): yêu cầu explicit confirmation

## 📦 Dependencies

- **KHÔNG CÀI** thêm npm package nếu chưa:
  1. Giải thích tại sao cần package này
  2. Đề xuất alternatives nếu có
  3. Được user chấp thuận
- Ưu tiên dùng những gì đã có trong codebase trước khi thêm mới

## 🗺️ Planning

- **LUÔN chạy Plan Mode** cho task ước tính >15 phút
- Plan phải bao gồm: mục tiêu, các bước, files ảnh hưởng, rủi ro, cách verify
- **ĐỢI user duyệt plan** trước khi bắt đầu implement

## 🌐 Ngôn ngữ

- **Báo cáo, giao tiếp với user:** Tiếng Việt
- **Code, comments, commit messages, variable names:** Tiếng Anh
- Không trộn lẫn ngôn ngữ trong cùng 1 ngữ cảnh

## ✅ Verify Loop (bắt buộc)

Sau MỖI thay đổi code, chạy theo thứ tự:
1. `npm run typecheck`
2. `npm run lint`
3. Test liên quan
4. Báo kết quả TRƯỚC KHI nói "đã xong"

## 📝 Commit

- Commit message: tiếng Anh, imperative mood (`Add feature X`, không phải `Added feature X`)
- Không commit code với `TODO` hoặc `FIXME` chưa resolve
- Không commit `console.log` debug

## 🚫 Không làm

- Không refactor code không liên quan đến task hiện tại
- Không thêm feature không được yêu cầu
- Không giả định requirements — hỏi nếu không chắc
- Không push lên remote nếu chưa được yêu cầu
