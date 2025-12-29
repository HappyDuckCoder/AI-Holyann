# 🚀 Hướng Dẫn Test & Chạy Ứng Dụng

## ✅ Kiểm Danh Sách Cấu Hình

Kiểm tra xem tất cả đã được cấu hình chưa:

- [x] **Supabase** - Database URL + Anon Key
- [x] **Local Database** - DATABASE_URL + DIRECT_URL
- [x] **JWT Secret** - JWT_SECRET (32 ký tự)
- [x] **NextAuth** - NEXTAUTH_SECRET + NEXTAUTH_URL
- [x] **Google OAuth** - GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET
- [x] **Prisma Schema** - Đã sync với database
- [x] **NextAuth Configuration** - Đã cấu hình Google Provider

---

## 🎯 Bước 1: Khởi Động Server

### Chạy Development Server:
```bash
npm run dev
```

**Output mong đợi**:
```
▲ Next.js 16.1.1
- Local:        http://localhost:3000
- Environments: .env.local, .env
```

### Truy cập ứng dụng:
- **Homepage**: http://localhost:3000
- **Login Page**: http://localhost:3000/login
- **Register Page**: http://localhost:3000/register

---

## 🔐 Bước 2: Test Đăng Nhập & Đăng Ký Cơ Bản

### Test Đăng Ký (Local):

1. **Truy cập**: http://localhost:3000/register
2. **Nhập thông tin**:
   - Tên: "Nguyễn Văn A"
   - Email: "test@example.com"
   - Mật khẩu: "password123"
   - Xác nhận mật khẩu: "password123"
3. **Nhấp "Đăng Ký"**
4. **Kiểm tra kết quả**:
   - ✅ Được chuyển hướng tới login page
   - ✅ Hiển thị thông báo thành công

### Test Đăng Nhập (Local):

1. **Truy cập**: http://localhost:3000/login
2. **Nhập thông tin**:
   - Email: "test@example.com"
   - Mật khẩu: "password123"
3. **Nhấp "Đăng Nhập"**
4. **Kiểm tra kết quả**:
   - ✅ Được chuyển hướng tới dashboard
   - ✅ Xem được thông tin user

---

## 🔵 Bước 3: Test Đăng Nhập Bằng Google

### Test Google Sign In:

1. **Truy cập**: http://localhost:3000/login
2. **Nhấp nút "Đăng nhập với Google"**
3. **Kiểm tra**:
   - ✅ Chuyển hướng tới Google Login
   - ✅ Đăng nhập bằng Google Account
   - ✅ Được redirect lại ứng dụng
   - ✅ Chuyển hướng tới dashboard

### Ghi Chú:
- Nếu không có Google Account, tạo một account: https://accounts.google.com
- Có thể sử dụng test account trong Google Cloud Console

---

## 📊 Bước 4: Kiểm Tra Database

### Xem dữ liệu trong Supabase:

1. **Vào [Supabase Dashboard](https://app.supabase.com/)**
2. **Chọn project "holyann-ai"**
3. **Vào SQL Editor**
4. **Chạy query**:
   ```sql
   SELECT id, email, full_name, auth_provider, created_at FROM users LIMIT 10;
   ```
5. **Kiểm tra**:
   - ✅ Có user mới từ đăng ký local
   - ✅ Có user mới từ Google OAuth

### Kiểm Tra Local Database:

1. **Chạy Prisma Studio**:
   ```bash
   npx prisma studio
   ```
   - Sẽ mở http://localhost:5555

2. **Xem bảng `users`**:
   - Kiểm tra user mới được tạo
   - Xem `auth_provider`: "LOCAL" hoặc "GOOGLE"

---

## 🔍 Bước 5: Kiểm Tra Log & Console

### Xem Server Log:

Kiểm tra terminal nơi bạn chạy `npm run dev`:

```
🔍 [DatabaseService] Creating user with data: { ... }
✅ [DatabaseService] User created in Supabase
✅ [DatabaseService] User synced to Local DB
```

### Xem Browser Console:

1. **Mở DevTools**: F12 hoặc Ctrl+Shift+I
2. **Vào tab Console**
3. **Kiểm tra errors**

### Kiểm Tra Network:

1. **Mở tab Network**
2. **Đăng nhập**
3. **Kiểm tra requests**:
   - POST `/api/auth/login` → 200 OK
   - POST `/api/auth/register` → 200 OK

---

## 🏗️ Bước 6: Build Production

### Test Build:

```bash
# Build ứng dụng
npm run build
```

**Kết quả mong đợi**:
```
✓ Compiled successfully in X.Xs
✓ Finished TypeScript check in X.Xs
✓ Generated static pages (22/22)
```

### Chạy Production Server:

```bash
npm start
```

- Sẽ chạy ở http://localhost:3000 (port khác nếu 3000 bị sử dụng)

---

## 📋 Kiểm Danh Sách Test

### Functional Tests:

- [ ] Trang Home hiển thị đúng
- [ ] Trang Login hiển thị
- [ ] Trang Register hiển thị
- [ ] Đăng ký local thành công
- [ ] Đăng nhập local thành công
- [ ] Logout thành công
- [ ] Đăng nhập Google thành công
- [ ] Redirect tới dashboard đúng
- [ ] User info hiển thị đúng
- [ ] Admin/Mentor dashboard hiển thị (nếu có role)

### Database Tests:

- [ ] Dữ liệu lưu vào Supabase
- [ ] Dữ liệu lưu vào Local Database
- [ ] Email unique constraint hoạt động
- [ ] Role được lưu đúng

### Performance Tests:

- [ ] Login không bị lag
- [ ] Google OAuth response nhanh
- [ ] Database query nhanh

---

## 🐛 Debug Tips

### Nếu gặp lỗi:

1. **Kiểm tra `.env` file**:
   ```bash
   cat .env | grep -E "JWT_SECRET|NEXTAUTH_SECRET|GOOGLE_CLIENT"
   ```

2. **Restart server**:
   ```bash
   # Bấm Ctrl+C để dừng
   # Sau đó chạy lại
   npm run dev
   ```

3. **Xóa cache**:
   ```bash
   rm -r .next
   npm run dev
   ```

4. **Kiểm tra network tab**:
   - Xem request/response
   - Kiểm tra error messages

5. **Xem server logs**:
   - Các log từ `console.log()` trong server-side code
   - Errors từ database/OAuth providers

---

## 📚 Tài Liệu Tham Khảo

| Feature | File | Docs |
|---------|------|------|
| **Auth Service** | [src/lib/services/auth.service.ts](src/lib/services/auth.service.ts) | N/A |
| **JWT Service** | [src/lib/services/jwt.service.ts](src/lib/services/jwt.service.ts) | [JWT_SECRET_GUIDE.md](JWT_SECRET_GUIDE.md) |
| **Database Service** | [src/lib/services/database.service.ts](src/lib/services/database.service.ts) | N/A |
| **NextAuth Setup** | [src/app/api/auth/[...nextauth]/route.ts](src/app/api/auth/[...nextauth]/route.ts) | [OAUTH_SETUP_GUIDE.md](OAUTH_SETUP_GUIDE.md) |
| **Login Component** | [src/components/auth/Login.tsx](src/components/auth/Login.tsx) | N/A |
| **Register Component** | [src/components/dashboard/Register.tsx](src/components/dashboard/Register.tsx) | N/A |

---

## 🎯 Tiếp Theo (Optional)

Sau khi test thành công, bạn có thể:

1. **Thêm role-based access control**: Quản lý quyền cho ADMIN/MENTOR
2. **Thêm email verification**: Xác thực email khi đăng ký
3. **Thêm 2FA**: Two-factor authentication
4. **Optimize database**: Index, caching, etc.
5. **Deploy**: Lên Vercel, AWS, hay hosting khác

---

## 💡 Tips & Best Practices

✅ **Luôn kiểm tra browser console** khi gặp lỗi
✅ **Sử dụng DevTools Network tab** để debug API calls
✅ **Xem server logs** để hiểu quá trình xử lý
✅ **Test trên incognito/private window** để tránh cache
✅ **Backup `.env` file** trước khi thay đổi

---

**Status**: ✅ Ứng Dụng Sẵn Sàng Test
**Last Updated**: 2025-12-26
