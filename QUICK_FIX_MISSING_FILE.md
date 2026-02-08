# 📋 Quick Fix Guide - Django Missing File Error

## 🎯 Vấn đề

Khi bấm "Xem kết quả phân tích AI", nhận được lỗi:
```
"Cannot connect to AI server"
Details: "[Errno 2] No such file or directory: 'D:\\server-ai\\holyann\\...\\interests.csv'"
```

## ✅ Giải pháp nhanh

### Cho ADMIN Django Server:

1. **Tạo file thiếu:**
```bash
cd D:\server-ai\holyann\hoexapp\module\feature2
mkdir config
cd config
```

2. **Tạo file `interests.csv`** với nội dung:
```csv
interest_code,interest_name,description
R,Realistic,Người thích làm việc với đồ vật máy móc
I,Investigative,Người thích nghiên cứu phân tích
A,Artistic,Người thích sáng tạo nghệ thuật
S,Social,Người thích giúp đỡ người khác
E,Enterprising,Người thích lãnh đạo quản lý
C,Conventional,Người thích tổ chức dữ liệu
```

3. **Restart Django server**

### Cho Next.js (ĐÃ SỬA XONG):

✅ Code đã được cải thiện để:
- Hiển thị error message rõ ràng: "Hệ thống đang thiếu dữ liệu cấu hình"
- Phân biệt lỗi connection vs lỗi file missing
- Hướng dẫn user liên hệ admin

## 🧪 Test sau khi fix

```powershell
# Test Django endpoint
curl -X POST http://127.0.0.1:8000/hoexapp/api/career-assessment/ -H "Content-Type: application/json" -d "{\"mbti_answers\":[1,2,3],\"grit_answers\":{},\"riasec_answers\":{}}"

# Test qua Next.js
# 1. Restart Next.js: npm run dev
# 2. Mở browser: http://localhost:3000/student/tests
# 3. Bấm "Xem kết quả phân tích AI"
```

## 📄 Chi tiết đầy đủ

Xem file: `DJANGO_FILE_MISSING_ERROR.md`
