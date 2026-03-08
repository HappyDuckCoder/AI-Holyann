# HoEx — Ứng dụng Hướng nghiệp & Du học

## Tổng quan

HoEx là ứng dụng web (Next.js) dành cho học sinh, cố vấn và quản trị viên với các luồng: **Student**, **Mentor**, **Admin** và trang **Pricing** (gói đăng ký cho học sinh).

---

## 1. Student Navbar

**Base path:** `/student`  
**Component:** `src/components/student/StudentNavbar.tsx`  
**Badge:** HỌC VIÊN

### Menu chính (nav chính)

| Tên           | Đường dẫn              | Mô tả                |
|---------------|-------------------------|----------------------|
| Tổng quan     | `/student/dashboard`    | Dashboard học viên   |
| Hồ sơ         | `/student/profile`      | Hồ sơ cá nhân        |
| Trắc nghiệm ngành | `/student/tests`    | Trắc nghiệm chọn ngành |
| Cải thiện hồ sơ | `/student/improve`   | Enhance hồ sơ, CV, essay |

### Dropdown user — Tính năng chính (mainFeatures)

| Tên                 | Đường dẫn                    | Mô tả                                      |
|---------------------|------------------------------|--------------------------------------------|
| Phân tích hồ sơ     | `/student/profile-analysis`  | Phân tích điểm mạnh – điểm yếu hồ sơ       |
| Trắc nghiệm ngành   | `/student/tests`             | Khám phá ngành học phù hợp                 |
| Ngành & Trường phù hợp | `/student/target`         | Reach / Match / Safe                       |
| Cải thiện hồ sơ     | `/student/improve`           | Enhance & phân tích hồ sơ, CV, essay       |
| Danh sách trường    | `/student/universities`      | Khám phá các trường đại học                |
| Báo cáo             | `/student/reports`            | Báo cáo tiến độ và kết quả                 |

### Dropdown user — Premium (premiumFeatures)

Cần gói trả phí; nếu chưa có subscription thì link dẫn về `/student/pricing`.

| Tên               | Đường dẫn            | Mô tả                          |
|-------------------|------------------------|--------------------------------|
| Chat với cố vấn   | `/student/chat`        | Trao đổi với mentor và AI      |
| Checklist         | `/student/checklist`   | Danh sách công việc            |
| Deadline          | `/student/deadlines`   | Hạn nộp hồ sơ, mốc quan trọng  |
| Đặt lịch mentor   | `/student/meeting`     | Đặt lịch gặp 1-1 với mentor    |

### User menu khác

- **Cài đặt:** `/student/settings`
- **Pricing:** `/student/pricing` (trang gói đăng ký)
- Chế độ sáng/tối, Đăng xuất

---

## 2. Mentor Navbar

**Base path:** `/mentor`  
**Component:** `src/components/mentor/MentorNavbar.tsx`  
**Badge:** CỐ VẤN

### Menu chính

| Tên       | Đường dẫn             | Mô tả              |
|-----------|------------------------|--------------------|
| Tổng quan | `/mentor/dashboard`    | Dashboard cố vấn   |
| Học viên  | `/mentor/students`     | Quản lý học viên   |
| Hạn nộp   | `/mentor/deadlines`    | Theo dõi deadline  |
| Hồ sơ     | `/mentor/profile`      | Hồ sơ cố vấn       |
| Trao đổi  | `/mentor/chat`         | Chat với học viên  |

### User dropdown

- Hồ sơ: `/mentor/profile`
- Chế độ sáng/tối
- Đăng xuất

---

## 3. Admin Navbar

**Base path:** `/admin`  
**Component:** `src/components/admin/AdminNavbar.tsx`  
**Badge:** QUẢN TRỊ

### Menu chính

| Tên       | Đường dẫn                | Mô tả           |
|-----------|---------------------------|-----------------|
| Tổng quan | `/admin/dashboard`        | Dashboard admin |
| Người dùng| `/admin/users`            | Quản lý user    |
| Học viên  | `/admin/students`         | Quản lý học viên|
| Cố vấn    | `/admin/mentors`          | Quản lý cố vấn  |
| Guests    | `/admin/guests`           | Quản lý khách   |

### User dropdown (menu phụ)

| Tên            | Đường dẫn                     |
|----------------|--------------------------------|
| Xếp hạng trường| `/admin/university-rankings`   |
| Feedback       | `/admin/feedback`              |
| Cài đặt        | `/admin/settings`              |
| Chế độ sáng/tối, Đăng xuất | —                    |

---

## 4. Pricing Page

**Đường dẫn:** `/student/pricing`  
**Component:** `src/app/student/pricing/page.tsx`  
**Guard:** Chỉ role `user` / `student` / `STUDENT`.

### Mục đích

Trang gói đăng ký Holyann cho học sinh: so sánh Free, Plus (AI), Premium (AI + All Advisors) và thực hiện nâng cấp / liên hệ bán hàng.

### Gói hiển thị

| Gói      | Tên hiển thị                    | Giá (Plus)     | Ghi chú                    |
|----------|----------------------------------|----------------|----------------------------|
| **FREE** | Free                             | 0đ             | Dùng thử, 1 lần/module AI  |
| **PLUS** | Plus (AI)                        | 399.000đ/6 tháng hoặc 599.000đ/năm | Phổ biến, mở khóa chi tiết AI |
| **PREMIUM** | Premium (AI + All Advisors)  | Liên hệ        | Tốt nhất, CTA "Liên hệ bán hàng" |

- **Chu kỳ thanh toán:** Tabs 6 tháng / 1 năm (chỉ áp dụng cho Plus).
- **Premium:** Nút "Liên hệ bán hàng" → `mailto:sales@holyann.com?subject=Đăng ký gói Premium`.
- Nâng cấp Plus: gọi `POST /api/subscription/upgrade` với `{ plan, billingCycle }`.

### Bảng so sánh (6 Feature AI)

Trang có bảng so sánh chi tiết theo cột **Free | Plus | Premium** cho:

1. **Feature 1 — Profile Analysis:** Phân tích profile gốc (số lần, mức độ chi tiết).
2. **Feature 2 — Trắc nghiệm → Ngành:** Số lần làm, số ngành hiển thị, % mờ/đầy đủ.
3. **Feature 3 — Reach / Match / Safe:** Số lần dùng, số ngành/trường, major fit %, match score, roadmap.
4. **Feature 4 — Enhance & Re-analysis:** Profile/CV/Essay — enhance + analysis (số lần / không giới hạn).
5. **Feature 5 — Danh sách trường:** Hiển thị danh sách trường (miễn phí cho mọi gói).
6. **Feature 6 — Reports:** Báo cáo PDF/in (1 lần Free, không giới hạn Plus/Premium).

---

## Cấu trúc file liên quan

- **Navbars:**  
  - `src/components/student/StudentNavbar.tsx`  
  - `src/components/mentor/MentorNavbar.tsx`  
  - `src/components/admin/AdminNavbar.tsx`
- **Dữ liệu menu student:** `src/data/student-nav-features.ts` (mainFeatures, premiumFeatures)
- **Pricing:** `src/app/student/pricing/page.tsx`
- **Layout theo role:**  
  - `src/app/student/layout.tsx`  
  - `src/app/(mentor)/layout.tsx`  
  - `src/app/admin/layout.tsx`
