# 🚀 Hướng dẫn Thiết lập OAuth (Google & Facebook)

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Thiết lập Google OAuth](#thiết-lập-google-oauth)
3. [Thiết lập Facebook OAuth](#thiết-lập-facebook-oauth)
4. [Cập nhật .env File](#cập-nhật-env-file)
5. [Kiểm tra và Test](#kiểm-tra-và-test)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Tổng Quan

Ứng dụng Holyann Explore hỗ trợ đăng nhập/đăng ký qua OAuth providers:
- **Google** (Bắt buộc)
- **Facebook** (Tùy chọn)

### Quy Trình Đăng Nhập OAuth:
1. Người dùng nhấp nút "Đăng nhập với Google/Facebook"
2. Chuyển hướng tới provider (Google/Facebook)
3. Người dùng xác thực
4. Provider trả về thông tin người dùng
5. Hệ thống tạo hoặc cập nhật user trong database
6. Tự động đồng bộ vào cả Supabase và Local Database
7. Redirect tới dashboard

---

## 🔐 Thiết lập Google OAuth

### Quick Start:

1. **Vào [Google Cloud Console](https://console.cloud.google.com/)**
   - Tạo project mới: "Holyann Explore"
   - Vào **APIs & Services** → **Enabled APIs & services**
   - Tìm và enable **Google+ API**

2. **Tạo OAuth 2.0 Credentials**
   - Vào **Credentials** → **+ Create Credentials**
   - Chọn **OAuth 2.0 Client IDs** → **Web Application**
   - Thêm **Authorized redirect URIs**:
     ```
     http://localhost:3000/api/auth/callback/google
     https://yourdomain.com/api/auth/callback/google
     ```
   - Sao chép **Client ID** và **Client Secret**

3. **Cập nhật `.env`**:
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

📖 **Chi tiết**: Xem [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)

---

## 🔐 Thiết lập Facebook OAuth

### Quick Start:

1. **Vào [Facebook Developer Console](https://developers.facebook.com/)**
   - Tạo app mới: "Holyann Explore"
   - Thêm **Facebook Login** product

2. **Cấu hình OAuth Redirect URIs**
   - Vào **Facebook Login** → **Settings**
   - Thêm **Valid OAuth Redirect URIs**:
     ```
     http://localhost:3000/api/auth/callback/facebook
     https://yourdomain.com/api/auth/callback/facebook
     ```
   - Sao chép **App ID** và **App Secret**

3. **Cập nhật `.env`**:
   ```env
   FACEBOOK_CLIENT_ID=your_app_id
   FACEBOOK_CLIENT_SECRET=your_app_secret
   ```

📖 **Chi tiết**: Xem [FACEBOOK_OAUTH_SETUP.md](FACEBOOK_OAUTH_SETUP.md)

---

## 📝 Cập nhật .env File

Hoàn chỉnh file `.env` của bạn:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database Configuration
DATABASE_URL="postgresql://user:password@host:port/database"
DIRECT_URL="postgresql://user:password@host:port/database"

# NextAuth Configuration
NEXTAUTH_SECRET=your_secret_key_min_32_chars

# Google OAuth (Required)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook OAuth (Optional)
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
```

### 🔑 Cách Tạo NEXTAUTH_SECRET:

```bash
# Sử dụng openssl
openssl rand -base64 32

# Hoặc sử dụng online generator
# https://generate-secret.vercel.app/
```

---

## ✅ Kiểm tra và Test

### 1. Khởi động ứng dụng:
```bash
npm run dev
```

### 2. Truy cập các trang:
- **Đăng nhập**: http://localhost:3000/login
- **Đăng ký**: http://localhost:3000/register

### 3. Test Google Sign In:
- Nhấp nút **"Đăng nhập với Google"**
- Đăng nhập bằng Google Account
- Kiểm tra redirect tới dashboard

### 4. Kiểm tra Database:
```bash
# Chạy Prisma Studio
npx prisma studio
```
- Xem bảng `users`
- Kiểm tra user mới được tạo với `auth_provider: 'GOOGLE'`

---

## 🐛 Troubleshooting

| Lỗi | Nguyên Nhân | Giải Pháp |
|-----|-----------|----------|
| **Invalid OAuth Redirect URI** | URL callback không khớp | Kiểm tra lại cấu hình ở Google/Facebook Console |
| **Client ID or Secret is invalid** | Biến môi trường sai | Cập nhật `.env` và restart server |
| **CORS Error** | Domain không được phép | Thêm domain vào Authorized Domains |
| **Sign in didn't work** | NEXTAUTH_SECRET không được thiết lập | Cập nhật `NEXTAUTH_SECRET` trong `.env` |
| **Page redirect loop** | Lỗi cấu hình callback | Kiểm tra `callbackUrl` trong component |

### Debug Mode:

Thêm log trong browser console:
```javascript
// Kiểm tra Session
import { useSession } from 'next-auth/react'
const { data: session } = useSession()
console.log('Current session:', session)
```

---

## 📚 Tài Liệu Thêm

- 🔗 [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)
- 🔗 [Facebook OAuth Docs](https://developers.facebook.com/docs/facebook-login)
- 🔗 [NextAuth.js Docs](https://next-auth.js.org/)

---

## 🎯 Kiểm Danh Sách

- [ ] Tạo Google OAuth Credentials
- [ ] Tạo Facebook OAuth Credentials (nếu cần)
- [ ] Cập nhật `.env` với Client ID/Secret
- [ ] Cập nhật `NEXTAUTH_SECRET`
- [ ] Kiểm tra Authorized Redirect URIs
- [ ] Khởi động ứng dụng: `npm run dev`
- [ ] Test Google Sign In
- [ ] Test Facebook Sign In (nếu đã thiết lập)
- [ ] Kiểm tra database có user mới

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Xem lại [Troubleshooting](#troubleshooting) section
2. Kiểm tra browser console và server logs
3. Xem chi tiết hướng dẫn trong `GOOGLE_OAUTH_SETUP.md`

---

**Version**: 1.0
**Last Updated**: 2025-12-26
