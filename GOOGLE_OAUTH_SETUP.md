# Hướng dẫn Thiết lập Google OAuth

## 1. Tạo Google OAuth Credentials

### Bước 1: Truy cập Google Cloud Console
1. Vào [Google Cloud Console](https://console.cl    oud.google.com/)
2. Đăng nhập bằng tài khoản Google của bạn
3. Tạo một project mới hoặc chọn project hiện có

### Bước 2: Kích Hoạt Google+ API
1. Vào **APIs & Services** → **Enabled APIs & services**
2. Nhấp **+ Enable APIs and Services**
3. Tìm kiếm **"Google+ API"** và nhấp vào nó
4. Nhấp **Enable**

### Bước 3: Tạo OAuth 2.0 Credentials
1. Vào **APIs & Services** → **Credentials**
2. Nhấp **+ Create Credentials** → **OAuth 2.0 Client IDs**
3. Chọn **Web Application** làm loại ứng dụng
4. Nhập tên ứng dụng (ví dụ: "Holyann Explore")

### Bước 4: Cấu hình Authorized Redirect URIs
Thêm các URI sau vào **Authorized redirect URIs**:

```
http://localhost:3000/api/auth/callback/google
https://yourdomain.com/api/auth/callback/google
```

**Lưu ý**: Thay `yourdomain.com` bằng domain thực của bạn khi deploy

### Bước 5: Lưu Client ID và Client Secret
1. Nhấp **Create**
2. Sao chép **Client ID** và **Client Secret**
3. Lưu lại những thông tin này

## 2. Cập nhật `.env` File

Cập nhật file `.env` với Google OAuth credentials:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Thay thế:
- `your_google_client_id` = Client ID từ Google Cloud Console
- `your_google_client_secret` = Client Secret từ Google Cloud Console

### Ví dụ hoàn chỉnh `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key_here_min_32_chars

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook OAuth (Optional)
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
```

## 3. Kiểm tra Cấu hình NextAuth

NextAuth đã được cấu hình trong [src/app/api/auth/[...nextauth]/route.ts](src/app/api/auth/[...nextauth]/route.ts):

```typescript
providers: [
    GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    // ... other providers
]
```

**Không cần chỉnh sửa file này**, chỉ cần cập nhật biến môi trường trong `.env`.

## 4. Kiểm tra Hoạt Động

1. **Khởi động ứng dụng**:
   ```bash
   npm run dev
   ```

2. **Truy cập trang đăng nhập/đăng ký**:
   - Đăng nhập: http://localhost:3000/login
   - Đăng ký: http://localhost:3000/register

3. **Nhấp nút "Đăng nhập với Google"** hoặc **"Đăng ký với Google"**

4. **Kiểm tra kết quả**:
   - ✅ Chuyển hướng tới Google login
   - ✅ Đăng nhập thành công bằng Google
   - ✅ Tự động tạo user mới hoặc đăng nhập user hiện có
   - ✅ Redirect tới dashboard

## 5. Các Lỗi Thường Gặp

### "Invalid OAuth Redirect URI"
- **Nguyên nhân**: URL callback không khớp với cấu hình
- **Giải pháp**: Kiểm tra lại **Authorized redirect URIs** trong Google Cloud Console
  ```
  http://localhost:3000/api/auth/callback/google
  https://yourdomain.com/api/auth/callback/google
  ```

### "CORS Error"
- **Nguyên nhân**: Google Origin không được phép
- **Giải pháp**: 
  1. Vào **OAuth consent screen**
  2. Thêm domain của bạn vào **Authorized domains**

### "Client ID or Secret is invalid"
- **Nguyên nhân**: Biến môi trường không được thiết lập đúng
- **Giải pháp**: 
  1. Kiểm tra `.env` file
  2. Restart server: `npm run dev`
  3. Xóa cache browser

### "Sign in didn't work"
- **Nguyên nhân**: NextAuth Secret không được thiết lập
- **Giải pháp**: Cập nhật `NEXTAUTH_SECRET` trong `.env`

## 6. Cách Tạo NEXTAUTH_SECRET

Để tạo một secret key an toàn, chạy lệnh:

```bash
openssl rand -base64 32
```

Hoặc sử dụng online generator: https://generate-secret.vercel.app/

Sao chép output và paste vào `.env`:
```env
NEXTAUTH_SECRET=your_generated_secret_here
```

## 7. Cập nhật Cho Production

Khi deploy lên production:

1. **Thêm domain production vào Google Cloud Console**:
   - **Authorized redirect URIs**: `https://yourdomain.com/api/auth/callback/google`
   - **OAuth consent screen**: Thêm domain vào **Authorized domains**

2. **Cập nhật `.env` trên production**:
   ```env
   GOOGLE_CLIENT_ID=your_production_google_client_id
   GOOGLE_CLIENT_SECRET=your_production_google_client_secret
   NEXTAUTH_SECRET=your_production_secret_key
   ```

3. **Đảm bảo HTTPS**: Google yêu cầu HTTPS cho production

## 8. Features Hỗ Trợ

Khi đăng nhập bằng Google, hệ thống sẽ:

✅ Tự động tạo user mới nếu chưa tồn tại
✅ Lưu thông tin từ Google (email, tên, avatar)
✅ Đồng bộ vào cả Supabase và Local Database
✅ Tạo JWT token cho session
✅ Redirect tới dashboard tương ứng với role

## 9. Thông Tin Người Dùng

Sau khi đăng nhập bằng Google, các thông tin sau sẽ được lưu:

```typescript
{
  id: "user_id",
  email: "user@gmail.com",
  full_name: "User Name",
  avatar_url: "https://...",
  auth_provider: "GOOGLE",
  auth_provider_id: "google_user_id",
  role: "STUDENT",
  is_active: true,
  created_at: "2025-12-26T..."
}
```

---

**Hỗ trợ thêm**: Xem [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
