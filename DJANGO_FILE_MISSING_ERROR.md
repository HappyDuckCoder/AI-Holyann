# 🚨 Django Server Error: Missing interests.csv

## ❌ Lỗi hiện tại

```json
{
  "success": false,
  "error": "AI server is missing required configuration files. Please contact administrator.",
  "details": "[Errno 2] No such file or directory: 'D:\\server-ai\\holyann\\hoexapp\\module\\feature2\\config\\interests.csv'",
  "suggestion": "The AI server is running but encountered an internal error. Check server logs for details."
}
```

## 🔍 Nguyên nhân

Django server **đang chạy bình thường**, nhưng thiếu file cấu hình `interests.csv` cần thiết cho module Feature 2 (Career Assessment).

File này nằm ở đường dẫn:
```
D:\server-ai\holyann\hoexapp\module\feature2\config\interests.csv
```

## ✅ Cách khắc phục (Django Admin)

### Bước 1: Kiểm tra thư mục config tồn tại chưa

```bash
cd D:\server-ai\holyann\hoexapp\module\feature2
dir config
```

Nếu thư mục `config` không tồn tại:
```bash
mkdir config
```

### Bước 2: Tạo file interests.csv

File `interests.csv` cần có format như sau (ví dụ):

```csv
interest_code,interest_name,description
R,Realistic,Người thích làm việc với đồ vật, máy móc, động vật
I,Investigative,Người thích nghiên cứu, phân tích, giải quyết vấn đề
A,Artistic,Người thích sáng tạo, thể hiện cá tính
S,Social,Người thích làm việc với mọi người, giúp đỡ người khác
E,Enterprising,Người thích lãnh đạo, thuyết phục, quản lý
C,Conventional,Người thích làm việc theo quy trình, tổ chức dữ liệu
```

### Bước 3: Copy file từ backup (nếu có)

Nếu đã có backup của file này:
```bash
copy D:\backup\interests.csv D:\server-ai\holyann\hoexapp\module\feature2\config\
```

### Bước 4: Khởi động lại Django server

```bash
# Stop server hiện tại (Ctrl+C)
# Sau đó chạy lại
python manage.py runserver 127.0.0.1:8000
```

### Bước 5: Test lại

Sau khi thêm file, test endpoint:
```bash
curl -X POST http://127.0.0.1:8000/hoexapp/api/career-assessment/ ^
  -H "Content-Type: application/json" ^
  -d "{\"mbti_answers\":[1,2,3,4,5,6,7,8,9,10],\"grit_answers\":{\"q1\":5,\"q2\":5},\"riasec_answers\":{\"q1\":5,\"q2\":5}}"
```

---

## 🔧 Cách khắc phục (từ phía Next.js - đã làm)

### ✅ Đã cải thiện error handling

1. **File:** `src/lib/ai-api-client.ts`
   - Cải thiện parsing Django error messages
   - Extract detailed error từ response body

2. **File:** `src/app/api/module2/career-assessment/route.ts`
   - Phân biệt connection error vs server error
   - Trả về message rõ ràng hơn:
     - 503 → "Cannot connect to AI server" (server không chạy)
     - 500 → "AI server is missing required configuration files" (server thiếu file)

3. **File:** `src/components/student/assessments/CareerAssessmentResults.tsx`
   - Detect file missing error và hiển thị message phù hợp
   - Toast notification cho user:
     ```
     Hệ thống đang thiếu dữ liệu cấu hình
     Vui lòng liên hệ quản trị viên để cập nhật dữ liệu cần thiết (interests.csv)
     ```

---

## 📊 Error Flow

```
User clicks "Xem kết quả phân tích AI"
    ↓
Next.js gọi /api/module2/career-assessment
    ↓
Next.js forward request đến Django: POST /hoexapp/api/career-assessment/
    ↓
Django tries to read: D:\...\interests.csv
    ↓
❌ File not found → Django returns error
    ↓
Next.js receives error với details: "[Errno 2] No such file..."
    ↓
Next.js detects "No such file" → Returns 500 với clear message
    ↓
Frontend component shows user-friendly error:
"Hệ thống đang thiếu dữ liệu cấu hình"
```

---

## 🎯 Checklist để fix

### Phía Django (Admin cần làm):
- [ ] Kiểm tra thư mục `feature2/config/` tồn tại
- [ ] Tạo hoặc copy file `interests.csv`
- [ ] Đảm bảo file có format đúng (CSV với header)
- [ ] Đảm bảo file có quyền đọc
- [ ] Restart Django server
- [ ] Test endpoint với curl

### Phía Next.js (Đã hoàn thành):
- [x] Cải thiện error parsing
- [x] Phân biệt connection vs server error
- [x] Hiển thị message rõ ràng cho user
- [x] Add file missing detection
- [x] User-friendly error messages

---

## 📝 Files khác có thể bị thiếu

Kiểm tra các file config khác trong Django project:

```
D:\server-ai\holyann\hoexapp\module\feature2\config\
├── interests.csv          ← Missing (gây lỗi hiện tại)
├── careers.csv            ← Cần kiểm tra
├── riasec_mapping.csv     ← Cần kiểm tra
└── mbti_traits.csv        ← Cần kiểm tra
```

Nếu thiếu các file khác, error sẽ tương tự. Solution: tạo hoặc restore từ backup.

---

## 🔗 Liên quan

- **Original error message:** "Cannot connect to AI server" (misleading)
- **Actual problem:** Django server đang chạy nhưng thiếu file config
- **Root cause:** File `interests.csv` không tồn tại tại path được config
- **User impact:** Không thể xem kết quả phân tích nghề nghiệp

---

## 💡 Gợi ý cải thiện cho Django

1. **Add validation khi startup:**
   ```python
   # settings.py hoặc apps.py
   def check_required_files():
       required_files = [
           'hoexapp/module/feature2/config/interests.csv',
           'hoexapp/module/feature2/config/careers.csv',
       ]
       for file in required_files:
           if not os.path.exists(file):
               warnings.warn(f"Required file missing: {file}")
   ```

2. **Provide default fallback:**
   ```python
   # Nếu file không tồn tại, dùng default data từ database hoặc hardcoded
   ```

3. **Better error messages:**
   ```python
   # Thay vì để Python throw FileNotFoundError,
   # catch và return JSON error rõ ràng
   try:
       with open(csv_path) as f:
           data = read_csv(f)
   except FileNotFoundError:
       return JsonResponse({
           'error': 'Configuration file missing',
           'details': f'Required file not found: {csv_path}',
           'action': 'Please contact administrator to restore config files'
       }, status=500)
   ```
