import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { AuthService } from '@/lib/services/auth.service'

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
        console.log('🔐 [NextAuth] Starting authorization...');

        if (!credentials?.email || !credentials?.password) {
          console.error('❌ [NextAuth] Missing credentials');
          throw new Error('Email và mật khẩu không được để trống');
        }

        console.log('📧 [NextAuth] Attempting login for:', credentials.email);

        try {
          const result = await AuthService.login({
            email: credentials.email,
            password: credentials.password
          });

          console.log('📊 [NextAuth] Login result:', {
            success: result.success,
            hasUser: !!result.user,
            message: result.message
          });

          if (!result.success || !result.user) {
            console.error('❌ [NextAuth] Login failed:', result.message);
            throw new Error(result.message || 'Đăng nhập thất bại');
          }

          console.log('✅ [NextAuth] Login successful for user:', result.user.id);

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
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
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
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login', // Redirect to login page on error
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development', // Enable debug in development
}
