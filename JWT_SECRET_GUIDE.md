# JWT Secret - Hướng dẫn Chi Tiết

## JWT Secret là gì?

**JWT Secret** là một khóa bí mật được sử dụng để ký và xác thực JSON Web Tokens (JWT). Nó được sử dụng trong quá trình:

1. **Tạo token**: Khi người dùng đăng nhập, token được ký bằng JWT Secret
2. **Xác thực token**: Khi người dùng gửi request, server xác minh token bằng JWT Secret

---

## 📍 JWT Secret Trong Ứng Dụng

### File Sử Dụng JWT Secret:
- **[src/lib/services/jwt.service.ts](src/lib/services/jwt.service.ts)** - Dịch vụ JWT

### Cách Sử Dụng:
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Tạo token
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })

// Xác thực token
const decoded = jwt.verify(token, JWT_SECRET)
```

---

## 🔑 Lấy JWT Secret

### Cách 1: Tạo JWT Secret Mới

#### **Trên Windows (PowerShell):**

1. **Mở PowerShell**

2. **Cài đặt OpenSSL (nếu chưa có):**
   ```powershell
   # Sử dụng Chocolatey
   choco install openssl
   
   # Hoặc tải từ https://slproweb.com/products/Win32OpenSSL.html
   ```

3. **Tạo JWT Secret:**
   ```powershell
   openssl rand -base64 32
   ```

   **Output ví dụ:**
   ```
   aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789+/==
   ```

#### **Trên macOS/Linux:**

```bash
openssl rand -base64 32
```

### Cách 2: Sử dụng Online Generator

Nếu không muốn cài openssl, có thể sử dụng online generator:
- https://generate-secret.vercel.app/
- https://www.random.org/strings/

### Cách 3: Sử dụng Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 📝 Cập Nhật JWT Secret

### 1. **Cấp Local Development**

Cập nhật file `.env.local`:

```env
JWT_SECRET=your_generated_secret_here
```

**Ví dụ:**
```env
JWT_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789+/==
```

### 2. **Cấp Production**

Cập nhật biến môi trường trên server production:

```bash
# Trong Vercel
# Settings → Environment Variables
JWT_SECRET=your_production_secret_here

# Trong Heroku
heroku config:set JWT_SECRET=your_production_secret_here

# Hoặc cập nhật trong .env.production
```

---

## ⚙️ Cấu Hình Hoàn Chỉnh `.env`

Tệp `.env` hoàn chỉnh nên có:

```env
# ============ Database Configuration ============
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL="postgresql://user:password@host:port/database"
DIRECT_URL="postgresql://user:password@host:port/database"

# ============ JWT Configuration ============
JWT_SECRET=your_jwt_secret_key_min_32_chars

# ============ NextAuth Configuration ============
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_min_32_chars

# ============ Google OAuth ============
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ============ Facebook OAuth (Optional) ============
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
```

---

## 🔒 Bảo Mật Best Practices

### ⚠️ **KHÔNG NÊN:**
- ❌ Commit `.env.local` vào git
- ❌ Chia sẻ JWT Secret công khai
- ❌ Sử dụng cùng secret cho dev và production
- ❌ Lưu JWT Secret trong code

### ✅ **NÊN:**
- ✅ Thêm `.env.local` vào `.gitignore`
- ✅ Sử dụng secret dài ít nhất 32 ký tự
- ✅ Thay đổi secret khi deploy production
- ✅ Lưu secret trong environment variables

### `.gitignore` Entry:
```
.env.local
.env.*.local
.env
```

---

## 🔄 Làm Cách Nào Để Rotate JWT Secret?

Nếu cần thay đổi JWT Secret (ví dụ vì security concerns):

1. **Tạo JWT Secret mới**
2. **Cập nhật `.env.local`**
3. **Restart server**
4. **Người dùng sẽ phải đăng nhập lại** (vì old tokens sẽ không hợp lệ)

---

## ✅ Kiểm Tra JWT Secret

### 1. Xem JWT Secret hiện tại:
```bash
# Linux/macOS
echo $JWT_SECRET

# Windows (PowerShell)
$env:JWT_SECRET
```

### 2. Kiểm tra `.env.local`:
```bash
cat .env.local | grep JWT_SECRET
```

### 3. Test JWT trong Node.js:
```javascript
// node repl
> const jwt = require('jsonwebtoken')
> const token = jwt.sign({ test: 'data' }, 'your-secret', { expiresIn: '1h' })
> jwt.verify(token, 'your-secret')
{ test: 'data', iat: ..., exp: ... }
```

---

## 🐛 Troubleshooting

| Vấn Đề | Nguyên Nhân | Giải Pháp |
|--------|-----------|----------|
| **Invalid Token** | JWT Secret không khớp | Kiểm tra JWT Secret trong `.env.local` |
| **Token Expired** | Token hết hạn | Người dùng cần đăng nhập lại |
| **Secret Not Found** | Biến môi trường không được set | Cập nhật `.env.local` và restart server |
| **Token Verification Failed** | Secret thay đổi sau khi token được tạo | Logout và login lại |

---

## 📚 Tài Liệu Tham Khảo

- [JWT.io - JWT Debugger](https://jwt.io/)
- [jsonwebtoken npm docs](https://www.npmjs.com/package/jsonwebtoken)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)

---

## 🎯 Tóm Tắt

1. **JWT Secret là gì**: Khóa bí mật để ký và xác thực tokens
2. **Cách tạo**: `openssl rand -base64 32`
3. **Nơi sử dụng**: [src/lib/services/jwt.service.ts](src/lib/services/jwt.service.ts)
4. **Cách cập nhật**: Thêm vào `.env.local`
5. **Bảo mật**: Không chia sẻ công khai, sử dụng secret dài

---

**Last Updated**: 2025-12-26
