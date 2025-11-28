# 📁 Hướng dẫn sử dụng thư mục images

Thư mục này chứa tất cả hình ảnh của dự án, được tổ chức theo từng mục đích sử dụng.

## 📂 Cấu trúc thư mục

```
public/images/
├── logos/          # Logo, biểu tượng thương hiệu
├── backgrounds/    # Hình nền, background images
├── icons/         # Icons nhỏ, biểu tượng chức năng
├── avatars/       # Ảnh đại diện người dùng
└── screenshots/   # Ảnh chụp màn hình demo
```

## 📋 Quy tắc đặt tên

- Sử dụng chữ thường và dấu gạch ngang: `logo-holyann.png`
- Thêm prefix cho loại ảnh: `bg-login.jpg`, `icon-user.svg`
- Đối với ảnh responsive: `hero-mobile.jpg`, `hero-desktop.jpg`

## 🎯 Cách sử dụng trong Next.js

```tsx
// Với Image component
import Image from 'next/image'

<Image
  src="/images/logos/logo.png"
  alt="Holyann Logo"
  width={200}
  height={60}
/>

// Với img tag thông thường
<img src="/images/backgrounds/bg-hero.jpg" alt="Hero Background" />
```

## 📏 Kích thước khuyến nghị

- **Logo**: 200x60px (PNG/SVG)
- **Background**: 1920x1080px (JPG/WebP)
- **Icons**: 24x24px (SVG)
- **Avatars**: 200x200px (JPG/PNG)
- **Screenshots**: 1366x768px (PNG)

## 🚀 Tối ưu hóa

- Nén ảnh trước khi thêm vào
- Sử dụng định dạng WebP khi có thể
- Đặt kích thước đúng để tránh layout shift