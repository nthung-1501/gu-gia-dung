# /plan — Chi tiết hóa kế hoạch trước khi code

## Mục đích

Bắt buộc đưa ra plan chi tiết và CHỜ user duyệt trước khi bắt đầu implement bất kỳ task nào ước tính >15 phút.

## Output bắt buộc

Khi user gọi `/plan <mô tả task>`, Claude phải output đầy đủ 5 phần sau:

---

### 1. Mục tiêu
- Task này làm gì? Tại sao cần làm?
- Definition of done cho task này là gì?

### 2. Các bước thực hiện
Liệt kê từng bước theo thứ tự, mỗi bước ghi rõ:
- [ ] **Bước N:** Mô tả hành động
  - File(s) sẽ tạo/sửa: `path/to/file`
  - Ước tính thời gian: X phút

### 3. Files bị ảnh hưởng
Liệt kê tất cả files sẽ được tạo mới, sửa đổi, hoặc xóa.

### 4. Rủi ro & Trade-offs
- Điều gì có thể sai?
- Có trade-off kỹ thuật nào không?
- Có dependency bên ngoài nào không?

### 5. Cách verify
- Chạy lệnh gì để kiểm tra đúng?
- Test case nào cần viết?

---

## Quy tắc

- **KHÔNG bắt đầu code** cho đến khi user reply "OK" hoặc tương đương
- Nếu user yêu cầu thay đổi plan, cập nhật và hỏi lại
- Nếu trong quá trình implement phát hiện plan cần thay đổi lớn → dừng lại, báo user
