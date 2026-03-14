import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { AuthService } from '@/lib/services/auth.service'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('❌ [NextAuth] Missing credentials');
          throw new Error('Email và mật khẩu không được để trống');
        }

        try {
          const result = await AuthService.login({
            email: credentials.email,
            password: credentials.password
          });

          if (!result.success || !result.user) {
            console.error('❌ [NextAuth] Login failed:', result.message);
            throw new Error(result.message || 'Đăng nhập thất bại');
          }

          return {
            id: result.user.id,
            email: result.user.email,
            name: result.user.full_name,
            role: result.user.role,
            image: result.user.avatar_url,
            accessToken: result.token,
            student: result.student || null
          };
        } catch (error: any) {
          console.error('❌ [NextAuth] Authorization error:', error);
          throw new Error(error.message || 'Đã xảy ra lỗi khi đăng nhập');
        }
      }
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account }) {
      // Google OAuth: tạo user + student trong DB (giống logic email/password)
      if (account?.provider === 'google' && user.email) {
        try {
          console.log('🔑 [NextAuth] Google signIn started for:', user.email);

          const result = await AuthService.oauthLogin(
            user.email,
            user.name || 'Google User',
            'GOOGLE',
            account.providerAccountId,
            user.image || undefined
          );

          console.log('🔑 [NextAuth] oauthLogin result:', {
            success: result.success,
            userId: result.user?.id,
            role: result.user?.role,
            hasStudent: !!result.student,
            message: result.message
          });

          if (!result.success || !result.user) {
            console.error('❌ [NextAuth] Google OAuth failed:', result.message);
            return `/login?error=OAuthFailed&message=${encodeURIComponent(result.message || 'Unknown error')}`;
          }

          // Gán DB user data vào user object → jwt callback sẽ nhận được
          user.id = result.user.id;
          user.role = result.user.role;
          user.student = result.student || null;
          // Lưu thêm dbUserId riêng phòng trường hợp id bị overwrite
          (user as any).dbUserId = result.user.id;

          return true;
        } catch (error) {
          console.error('❌ [NextAuth] Google signIn error:', error);
          return `/login?error=OAuthException`;
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // Lần đầu login (user != null) → lưu thông tin vào token
      if (user) {
        // Ưu tiên dbUserId (set trong signIn callback) → đảm bảo dùng DB id, không phải Google id
        const dbId = (user as any).dbUserId || user.id;
        token.sub = dbId;
        token.role = user.role || 'STUDENT';
        token.student = user.student || undefined;

        if (account?.provider === 'google') {
          token.accessToken = account.access_token;
        } else if (user.accessToken) {
          token.accessToken = user.accessToken;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub as string;
        (session.user as any).role = token.role as string;
        (session.user as any).student = token.student;
        (session as any).accessToken = token.accessToken as string;

        // Attach subscription plan for student actor (used by subscription system)
        // Prisma returns snake_case: subscription_plan, not subscriptionPlan
        try {
          const user = await prisma.users.findUnique({
            where: { id: token.sub as string },
            select: { subscription_plan: true },
          });
          const raw = (user?.subscription_plan ?? 'FREE').toString().trim().toUpperCase();
          const plan =
            raw === 'ADVANCED' ? 'PREMIUM' : ['FREE', 'PLUS', 'PREMIUM'].includes(raw) ? raw : 'FREE';
          (session.user as any).subscriptionPlan = plan;
          (session.user as any).reportsUsed = 0;
        } catch (error) {
          console.error('[NextAuth] Failed to load subscription fields:', error);
          (session.user as any).subscriptionPlan = 'FREE';
          (session.user as any).reportsUsed = 0;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // Redirect to login page on error
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development', // Enable debug in development
}
