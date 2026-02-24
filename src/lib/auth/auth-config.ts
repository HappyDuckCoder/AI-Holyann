import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { AuthService } from '@/lib/auth/service/auth.service'
import { JWTService } from '@/lib/services/jwt.service'

// Production redirect_uri_mismatch? Set NEXTAUTH_URL on Vercel, then in Google Console
// add to Authorized redirect URIs: https://<your-domain>/api/auth/callback/google

const INVALID_CREDENTIALS_MESSAGE = 'Invalid credentials'

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
          throw new Error(INVALID_CREDENTIALS_MESSAGE)
        }

        const result = await AuthService.login({
          email: credentials.email,
          password: credentials.password
        })

        if (!result.success || !result.user) {
          throw new Error(INVALID_CREDENTIALS_MESSAGE)
        }

        return {
          id: result.user.id,
          email: result.user.email,
          name: result.user.full_name,
          role: result.user.role,
          image: result.user.avatar_url,
          accessToken: result.token,
          student: result.student || null
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
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.role = user.role;
        token.student = user.student || undefined;
        if (account?.provider === 'google') {
          token.accessToken = account.access_token;
          // NextAuth mặc định dùng Google sub làm token.sub → sai với user đã đăng ký email.
          // Gọi DB: tìm/link/tạo user theo email Google, dùng id của user trong DB làm token.sub.
          const googleProfile = (profile ?? user) as { email?: string; name?: string; sub?: string; picture?: string; image?: string };
            if (googleProfile?.email) {
            const dbUser = await AuthService.findOrCreateOrLinkByGoogleProfile({
              email: googleProfile.email,
              name: googleProfile.name ?? (user as { name?: string }).name ?? null,
              sub: googleProfile.sub ?? (user.id as string),
              picture: googleProfile.picture ?? (user as { image?: string }).image ?? null,
            });
            if (dbUser) {
              token.sub = dbUser.id;
              token.role = dbUser.role;
              (token as { student?: unknown }).student = dbUser.student ?? undefined;
              // Dùng JWT của app làm accessToken để API (đổi mật khẩu, v.v.) nhận dạng user
              token.accessToken = JWTService.generateToken({
                userId: dbUser.id,
                email: dbUser.email,
                role: dbUser.role as 'STUDENT' | 'MENTOR' | 'ADMIN',
              });
            }
          }
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
