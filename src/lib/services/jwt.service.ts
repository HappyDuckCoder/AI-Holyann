import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';
import { UserRole } from '../types/auth.types.js';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';
const JWT_ISSUER = process.env.JWT_ISSUER || 'holyann-auth';
const REFRESH_EXPIRES_DAYS = 30;

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export class JWTService {
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(
      { ...payload },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        issuer: JWT_ISSUER,
      }
    );
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, { issuer: JWT_ISSUER }) as JWTPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload | null;
    } catch {
      return null;
    }
  }

  /** Tạo refresh token và lưu hash vào DB. Trả về token (plain) để gửi client. Nếu bảng refresh_tokens không tồn tại thì vẫn trả về token để login không lỗi. */
  static async createRefreshToken(userId: string): Promise<{ token: string; expiresAt: Date }> {
    const token = randomBytes(40).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
    try {
      await prisma.refresh_tokens.create({
        data: { user_id: userId, token_hash: tokenHash, expires_at: expiresAt },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('does not exist') || (err as { code?: string })?.code === 'P2021') {
        console.warn('[JWTService] refresh_tokens table missing, skip create:', msg);
      } else {
        throw err;
      }
    }
    return { token, expiresAt };
  }

  static async verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
    try {
      const tokenHash = createHash('sha256').update(token).digest('hex');
      const row = await prisma.refresh_tokens.findFirst({
        where: { token_hash: tokenHash, expires_at: { gt: new Date() } },
      });
      if (!row) return null;
      return { userId: row.user_id };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('does not exist') || (err as { code?: string })?.code === 'P2021') {
        return null;
      }
      throw err;
    }
  }

  /**
   * Xóa mọi refresh token của user (sau đổi mật khẩu). Bắt lỗi nếu bảng refresh_tokens không tồn tại.
   */
  static async revokeRefreshTokensForUser(userId: string): Promise<void> {
    try {
      await prisma.refresh_tokens.deleteMany({ where: { user_id: userId } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('does not exist') || (err as { code?: string })?.code === 'P2021') {
        console.warn('[JWTService] refresh_tokens table missing, skip revoke:', msg);
      } else {
        console.error('[JWTService] revokeRefreshTokensForUser failed:', err);
      }
    }
  }
}

