# Hoex — HolyAnn AI Web

Ứng dụng web mentoring & hướng nghiệp dành cho học sinh, kết nối với mentor và các công cụ AI (phân tích hồ sơ, đánh giá, chat realtime).

## Công nghệ

- **Framework:** Next.js 16, React 19
- **Auth:** NextAuth.js
- **Database:** PostgreSQL (Prisma), Supabase (realtime, storage)
- **UI:** Tailwind CSS 4, Radix UI, Framer Motion, Lucide
- **AI:** Google GenAI (Gemini), tích hợp server-ai

## Yêu cầu

- Node.js 20+
- PostgreSQL (hoặc Supabase)
- Tài khoản Supabase (realtime, storage, optional)

## Cài đặt

```bash
# Clone và vào thư mục
cd hoex

# Cài dependency
npm install

# Tạo file .env (xem mục Biến môi trường)
# Sau đó generate Prisma client và chạy migration
npx prisma generate
npx prisma migrate deploy
```

## Biến môi trường

Tạo file `.env` trong thư mục `hoex` với các biến sau:

```env
# Database (PostgreSQL / Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

# Supabase (chat realtime, storage, upload)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
```

## Chạy dự án

```bash
# Development
npm run dev

# Build & start production
npm run build
npm start
```

Ứng dụng mặc định chạy tại [http://localhost:3000](http://localhost:3000).

## Scripts chính

| Script | Mô tả |
|--------|--------|
| `npm run dev` | Chạy dev server |
| `npm run build` | Build production |
| `npm run start` | Chạy bản build |
| `npm run lint` | Chạy ESLint |
| `npx prisma generate` | Generate Prisma Client |
| `npm run test:e2e` | E2E với Playwright |
| `npm run sync:from-supabase` | Đồng bộ schema từ Supabase |
| `npm run sync:to-supabase` | Đồng bộ schema lên Supabase |

## Cấu trúc thư mục (tóm tắt)

```
hoex/
├── prisma/           # Schema & migrations
├── database/         # SQL scripts (chat, RLS, seed...)
├── src/
│   ├── app/          # Routes (student, admin, mentor, dashboard, chat...)
│   ├── components/   # UI, chat, student, mentor, admin
│   ├── actions/      # Server actions
│   ├── hooks/        # useChat, useChatRealtime, useAuthSession...
│   ├── lib/          # Auth, Prisma, Supabase, services
│   ├── services/     # AI, database (profile, assessment, reporting...)
│   └── types/        # TypeScript types
├── public/
├── tests/e2e/        # Playwright E2E
└── scripts/          # Tiện ích build / sync
```

## Tính năng chính

- **Học sinh:** Đăng ký/đăng nhập, dashboard, hồ sơ, checklist, bài test (MBTI, RIASEC, Grit), chat với mentor, SWOT, roadmap, cơ hội, profile enhancer (CV, essay), báo cáo, study journal.
- **Mentor:** Dashboard, danh sách học sinh, task, chat.
- **Admin:** Quản lý user, mentor, student, university, file review.

## Database

- Schema chính định nghĩa trong `prisma/schema.prisma`.
- Một số tính năng (chat realtime, storage) dùng Supabase; script setup trong `database/` (ví dụ `setup-chat-system.sql`, `enable-realtime.sql`).

## Tài liệu thêm

- [OPTIMIZATION_GUIDE.md](./OPTIMIZATION_GUIDE.md) — Gợi ý tối ưu
- [docs/](./docs/) — Tài liệu tính năng (avatar, migration...)
- [server-ai](../server-ai/) — Backend AI (trong monorepo)

## License

Private.
