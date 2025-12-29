# Hướng dẫn Thiết lập Facebook OAuth

## 1. Tạo Facebook App

### Bước 1: Truy cập Facebook Developer Dashboard
1. Vào [Facebook Developer Console](https://develope    rs.facebook.com/)
2. Đăng nhập bằng tài khoản Facebook của bạn
3. Nếu chưa là developer, vui lòng hoàn thành quá trình đăng ký

### Bước 2: Tạo App Mới
1. Nhấp vào **My Apps** → **Create App**
2. Chọn **Consumer** làm loại app
3. Điền thông tin:
   - **App Name**: Nhập tên app (ví dụ: "Holyann Explore")
   - **App Contact Email**: Nhập email liên hệ
   - **App Purpose**: Chọn mục đích sử dụng
   - **Category**: Chọn "Education"
4. Nhấp **Create App**

### Bước 3: Thêm Facebook Login Product
1. Tìm **Facebook Login** trong danh sách products
2. Nhấp **Set Up** hoặc **Get Started**
3. Chọn **Web** làm platform

### Bước 4: Cấu hình OAuth Redirect URIs
1. Vào **Settings** → **Basic** (lưu lại **App ID** và **App Secret**)
2. Vào **Facebook Login** → **Settings**
3. Thêm Redirect URIs sau vào **Valid OAuth Redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/facebook
   https://yourdomain.com/api/auth/callback/facebook
   ```

## 2. Cập nhật `.env` File

Sao chép **App ID** và **App Secret** từ Facebook Developer Dashboard và cập nhật file `.env`:

```env
# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
```

Thay thế:
- `your_facebook_app_id` = App ID từ Facebook
- `your_facebook_app_secret` = App Secret từ Facebook

## 3. Kiểm tra Cấu hình

1. Khởi động ứng dụng:
   ```bash
   npm run dev
   ```

2. Truy cập trang đăng nhập: http://localhost:3000/login

3. Nhấp nút **Facebook** và kiểm tra xem nó có chuyển hướng tới Facebook login hay không

## 4. Các Lỗi Thường Gặp

### "Invalid OAuth Redirect URI"
- **Giải pháp**: Đảm bảo Redirect URI trong `.env` khớp với URL được đăng ký trong Facebook Developer Console

### "App Not Set Up"
- **Giải pháp**: Đảm bảo bạn đã hoàn thành setup Facebook Login product

### "CORS Error"
- **Giải pháp**: Kiểm tra **App Domains** trong **Settings** → **Basic** và thêm domain của bạn

## 5. Cập nhật Cho Production

Khi deploy lên production, hãy:

1. Thêm domain production vào **Valid OAuth Redirect URIs**:
   ```
   https://yourdomain.com/api/auth/callback/facebook
   ```

2. Cập nhật biến môi trường:
   ```env
   FACEBOOK_CLIENT_ID=your_production_facebook_app_id
   FACEBOOK_CLIENT_SECRET=your_production_facebook_app_secret
   ```

3. Đảm bảo **App Status** là **Live** (không phải Development)

## 6. Kích Hoạt Tính Năng Email Access (Tùy Chọn)

Để lấy email từ Facebook user:

1. Vào **App Roles** → **Test Users** (để add test users)
2. Vào **Settings** → **Basic** → **App Review**
3. Yêu cầu quyền `email` và chờ approval từ Facebook

---

**Hỗ trợ thêm**: Xem [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
