# 🔄 Hướng Dẫn Nhanh - Đồng Bộ Database

## ✅ Đã Hoàn Thành

Hệ thống của bạn đã được cấu hình để **tự động đồng bộ dữ liệu** giữa:

- 🌐 **Supabase** (Cloud Database)
- 💻 **Local PostgreSQL** (thông qua Prisma)

## 🎯 Tính Năng Chính

### 1. Tự Động Đồng Bộ Khi Đăng Ký/Đăng Nhập

- ✅ Dữ liệu được ghi vào **CẢ HAI** databases
- ✅ Nếu Local DB fail, hệ thống vẫn hoạt động bình thường
- ✅ Auto-sync khi phát hiện dữ liệu thiếu

### 2. Chiến Lược Đọc Thông Minh

- 🚀 **Ưu tiên**: Đọc từ Local DB (nhanh hơn)
- 🔄 **Fallback**: Tự động chuyển sang Supabase nếu cần
- 🔁 **Auto-sync**: Đồng bộ dữ liệu thiếu từ Supabase về Local

## 🚀 Sử Dụng

### Kiểm tra tình trạng đồng bộ:

```bash
npm run sync:status
```

### Đồng bộ từ Supabase về Local:

```bash
npm run sync:from-supabase
```

### Đồng bộ từ Local lên Supabase:

```bash
npm run sync:to-supabase
```

## 📡 API Endpoint

```bash
# Kiểm tra status
curl http://localhost:3000/api/sync

# Đồng bộ từ Supabase
curl -X POST http://localhost:3000/api/sync \
  -H "Content-Type: application/json" \
  -d '{"action": "from-supabase"}'
```

## 📝 Files Đã Thay Đổi

1. ✅ `src/lib/services/database.service.ts` - Thêm logic đồng bộ tự động
2. ✅ `src/lib/services/sync.service.ts` - Service đồng bộ thủ công
3. ✅ `src/app/api/sync/route.ts` - API endpoint
4. ✅ `sync-db.ts` - CLI script
5. ✅ `package.json` - Thêm npm scripts

## 🎉 Kết Quả

Bây giờ mọi user mới đăng ký sẽ được lưu vào:

- ✅ Supabase (Primary)
- ✅ Local Database (Secondary)

Và bạn có thể:

- ✅ Đồng bộ thủ công khi cần
- ✅ Kiểm tra tình trạng đồng bộ
- ✅ Auto-recovery khi có dữ liệu thiếu

Xem chi tiết tại: `DATABASE_SYNC.md`

