# 🔧 Hướng dẫn kiểm tra kết nối AI Server

## ✅ Đã sửa các vấn đề sau:

### 1. **Sửa biến môi trường**
- Trước: Code dùng `process.env.AI_API_URL`
- Sau: Code dùng `process.env.AI_SERVER_URL` (khớp với file `.env`)
- File đã sửa:
  - `src/lib/ai-api-client.ts`
  - `src/app/api/module4/profile-improver/analysis/route.ts`
  - `src/app/api/module4/profile-improver/enhance/route.ts`

### 2. **Cải thiện error handling**
- Thêm timeout 30 giây cho mỗi request
- Thêm logging chi tiết để debug
- Cải thiện error messages cho các trường hợp:
  - Connection refused (server không chạy)
  - Timeout (server quá chậm)
  - Network errors

### 3. **Thêm test endpoint**
- Tạo endpoint `/api/test-ai-connection` để test kết nối đến AI server

---

## 🧪 Cách kiểm tra

### Bước 1: Khởi động lại Next.js server

```powershell
# Stop server hiện tại (Ctrl+C)
# Sau đó chạy lại
npm run dev
```

### Bước 2: Kiểm tra AI Server đang chạy

Mở terminal mới và chạy:

```powershell
# Kiểm tra port 8000 có mở không
netstat -an | findstr "8000"

# Kiểm tra Django server response
curl http://127.0.0.1:8000/

# Hoặc dùng PowerShell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/" -Method GET
```

### Bước 3: Test kết nối từ Next.js

Truy cập URL sau trong browser hoặc dùng curl:

```
http://localhost:3000/api/test-ai-connection
```

Hoặc dùng curl:

```powershell
curl http://localhost:3000/api/test-ai-connection
```

Kết quả sẽ hiển thị:
- ✅ Các endpoint nào connect được
- ❌ Các endpoint nào bị lỗi
- Chi tiết lỗi (timeout, connection refused, etc.)

### Bước 4: Test API thực tế

Sau khi test connection thành công, thử gọi API career assessment:

```powershell
# Ví dụ test career assessment
curl -X POST http://localhost:3000/api/module2/career-assessment `
  -H "Content-Type: application/json" `
  -d '{"student_id": "your-student-id"}'
```

---

## 🔍 Debug nếu vẫn lỗi

### Kiểm tra Django server logs

Trong terminal chạy Django server, bạn sẽ thấy logs khi có request đến. Nếu không thấy logs nào, nghĩa là request không đến được Django.

### Kiểm tra Next.js logs

Trong terminal chạy Next.js, bạn sẽ thấy logs:

```
🔄 [AI API] POST http://127.0.0.1:8000/hoexapp/api/career-assessment/
📤 [AI API] Request body: {...}
```

Nếu thấy lỗi:
- `fetch failed` → Django server không chạy hoặc sai địa chỉ
- `timeout` → Django server chạy quá chậm
- `404` → Endpoint không tồn tại
- `500` → Lỗi từ Django server

### Kiểm tra biến môi trường

Thêm log vào code để xem biến môi trường:

```typescript
console.log('AI_SERVER_URL:', process.env.AI_SERVER_URL);
```

### Kiểm tra firewall/antivirus

Có thể firewall hoặc antivirus chặn kết nối localhost. Thử:
- Tắt tạm firewall
- Thêm exception cho port 8000 và 3000

---

## 📋 Checklist

- [ ] Django server đang chạy trên port 8000
- [ ] Có thể curl/browse http://127.0.0.1:8000/
- [ ] File `.env` có `AI_SERVER_URL=http://127.0.0.1:8000`
- [ ] Đã restart Next.js dev server sau khi sửa code
- [ ] Test endpoint `/api/test-ai-connection` pass
- [ ] Không có firewall/antivirus chặn

---

## 🎯 Các endpoint AI Server cần có

Django server cần có các endpoint sau:

1. `/hoexapp/api/profile-analysis/` (POST)
2. `/hoexapp/api/career-assessment/` (POST)
3. `/hoexapp/api/mbti/` (POST)
4. `/hoexapp/api/grit-scale/` (POST)
5. `/hoexapp/api/riasec/` (POST)
6. `/hoexapp/api/university-recommendation/` (POST)
7. `/hoexapp/api/profile-improver/analysis/` (POST)
8. `/hoexapp/api/profile-improver/enhance/` (POST)

Tất cả đều phải accept POST request với JSON body.

---

## 📞 Nếu vẫn gặp vấn đề

Gửi cho tôi:
1. Output của `/api/test-ai-connection`
2. Django server logs
3. Next.js server logs
4. Output của `netstat -an | findstr "8000"`
