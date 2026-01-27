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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const result = await AuthService.login({
            email: credentials.email,
            password: credentials.password
          });

          if (!result.success || !result.user) {
            return null;
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
          return null;
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
        token.student = user.student;
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
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.student = token.student;
        session.accessToken = token.accessToken as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
