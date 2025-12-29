# Hướng Dẫn Đồng Bộ Database

Hệ thống hiện đã được cấu hình để đồng bộ dữ liệu giữa **Supabase** (cloud database) và **Local Database** (PostgreSQL
thông qua Prisma).

## 🎯 Tính Năng

### 1. **Đồng Bộ Tự Động**

Khi tạo hoặc đăng nhập user mới:

- Dữ liệu được ghi đồng thời vào cả Supabase và Local DB
- Nếu Local DB không khả dụng, vẫn tiếp tục với Supabase (không làm gián đoạn user)
- Log chi tiết để theo dõi quá trình đồng bộ

### 2. **Read Strategy (Chiến Lược Đọc)**

Khi truy vấn user:

- **Ưu tiên**: Đọc từ Local DB trước (nhanh hơn)
- **Fallback**: Nếu Local DB fail, tự động chuyển sang Supabase
- **Auto-sync**: Nếu tìm thấy user trong Supabase mà không có trong Local DB, tự động đồng bộ về

### 3. **Manual Sync (Đồng Bộ Thủ Công)**

Có 3 cách để đồng bộ thủ công:

## 📦 Cài Đặt

Trước tiên, cài đặt dependencies nếu chưa có:

```bash
npm install
```

Đảm bảo file `.env.local` có đủ thông tin:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Local Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
DIRECT_URL=postgresql://user:password@localhost:5432/database_name
```

## 🚀 Sử Dụng

### A. Command Line (Khuyến Nghị)

#### 1. Kiểm tra tình trạng đồng bộ

```bash
npm run sync:status
```

Output:

```
📊 Sync Status:
  🌐 Supabase: 10 users
  💻 Local DB: 10 users
  ✅ Status: Databases đang đồng bộ
```

#### 2. Đồng bộ từ Supabase về Local DB

```bash
npm run sync:from-supabase
```

Sử dụng khi:

- Bạn có dữ liệu mới trong Supabase cần đồng bộ về Local
- Local DB bị mất dữ liệu
- Lần đầu setup Local DB

#### 3. Đồng bộ từ Local DB lên Supabase

```bash
npm run sync:to-supabase
```

Sử dụng khi:

- Bạn có dữ liệu test trong Local DB muốn đẩy lên Supabase
- Restore backup từ Local DB

### B. API Endpoint

Bạn có thể gọi API để đồng bộ:

#### 1. Kiểm tra status

```bash
# GET request
curl http://localhost:3000/api/sync
```

#### 2. Đồng bộ từ Supabase

```bash
# POST request
curl -X POST http://localhost:3000/api/sync \
  -H "Content-Type: application/json" \
  -d '{"action": "from-supabase"}'
```

#### 3. Đồng bộ lên Supabase

```bash
# POST request
curl -X POST http://localhost:3000/api/sync \
  -H "Content-Type: application/json" \
  -d '{"action": "to-supabase"}'
```

#### 4. Kiểm tra status (POST)

```bash
curl -X POST http://localhost:3000/api/sync \
  -H "Content-Type: application/json" \
  -d '{"action": "status"}'
```

### C. Trong Code (Programmatic)

```typescript
import {SyncService} from '@/lib/services/sync.service'

// Kiểm tra tình trạng đồng bộ
const status = await SyncService.checkSyncStatus()
console.log(status)

// Đồng bộ từ Supabase
const result = await SyncService.syncAllUsersFromSupabase()
console.log(result)

// Đồng bộ lên Supabase
const result2 = await SyncService.syncAllUsersToSupabase()
console.log(result2)
```

## 🔄 Luồng Hoạt Động

### Khi Đăng Ký User Mới:

```
User Register
    ↓
Hash Password
    ↓
Write to Supabase ✅ (Primary)
    ↓
Write to Local DB ✅ (Secondary - non-blocking)
    ↓
Return Success to User
```

### Khi Đăng Nhập:

```
Login Request
    ↓
Try Local DB First
    ↓
Found? → Verify & Login ✅
    ↓
Not Found? → Try Supabase
    ↓
Found in Supabase? → Auto-sync to Local DB → Login ✅
    ↓
Not Found? → Return Error ❌
```

## 📊 Monitoring & Logging

Tất cả các thao tác đồng bộ đều được log chi tiết:

- ✅ Success operations
- ⚠️ Warnings (sync failed but main operation continues)
- ❌ Errors (operations that need attention)

Xem logs trong console khi chạy development server:

```bash
npm run dev
```

## ⚠️ Lưu Ý Quan Trọng

1. **Supabase là Source of Truth**: Luôn ưu tiên Supabase cho write operations
2. **Non-blocking Local Sync**: Nếu Local DB fail, user vẫn có thể sử dụng hệ thống
3. **Auto-recovery**: Hệ thống tự động đồng bộ khi phát hiện missing data
4. **ID Consistency**: Sử dụng UUID để đảm bảo ID giống nhau giữa 2 databases

## 🔧 Troubleshooting

### Vấn đề: Local DB không kết nối được

```bash
# Kiểm tra Prisma connection
npx prisma db pull

# Nếu cần, generate lại Prisma Client
npx prisma generate
```

### Vấn đề: Databases không đồng bộ

```bash
# Kiểm tra status
npm run sync:status

# Đồng bộ từ Supabase về Local
npm run sync:from-supabase
```

### Vấn đề: Duplicate entries

Hệ thống sử dụng `upsert` để tránh duplicate. Nếu vẫn gặp lỗi:

```bash
# Xóa Local DB và sync lại
npx prisma migrate reset
npm run sync:from-supabase
```

## 📈 Best Practices

1. **Development**: Sử dụng Local DB để test nhanh
2. **Production**: Luôn kiểm tra cả 2 databases đang sync
3. **Backup**: Định kỳ chạy sync để đảm bảo consistency
4. **Monitoring**: Theo dõi logs để phát hiện vấn đề sớm

## 🎉 Kết Quả

Sau khi thiết lập, bạn sẽ có:

- ✅ Dữ liệu được ghi vào cả Supabase và Local DB
- ✅ Đọc nhanh từ Local DB, fallback về Supabase
- ✅ Auto-sync khi phát hiện missing data
- ✅ Manual sync tools khi cần
- ✅ API endpoint để tích hợp với các services khác
- ✅ Detailed logging để debug

---

**Tác giả**: Holyann AI Development Team  
**Ngày cập nhật**: December 2025

