import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { UserRepository, BCRYPT_SALT_ROUNDS } from '@/lib/auth/repository/user.repository';
import { JWTService } from '@/lib/services/jwt.service';
import { DatabaseService } from '@/lib/services/database.service';
import { authErrorResponse, ERROR_CODES } from '@/lib/auth/errors';
import type { AuthErrorResponse as AuthErr } from '@/lib/auth/errors';
import type { AuthResponse, UserRole } from '@/lib/types/auth.types';
import type { RegisterInput, LoginInput, ChangePasswordInput, SetPasswordInput, DeleteAccountInput } from '@/lib/auth/validator/schemas';

const INVALID_CREDENTIALS_MESSAGE = 'Invalid credentials';

function toPublicUser(user: { id: string; email: string; full_name: string; role: string; avatar_url?: string | null }): {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
} {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role as UserRole,
    avatar_url: user.avatar_url ?? undefined,
  };
}

export const AuthService = {
  /**
   * Đăng ký: kiểm tra email trùng (409), normalize email, password đã validate + hash bcrypt (salt >= 10).
   * Không trả password về client.
   */
  async register(input: RegisterInput): Promise<AuthResponse | AuthErr> {
    const email = UserRepository.normalizeEmail(input.email);
    const exists = await UserRepository.existsByEmail(email);
    if (exists) {
      return authErrorResponse('Email already in use', ERROR_CODES.EMAIL_IN_USE);
    }

    const user = await UserRepository.createUser({ ...input, email });
    if (!user) {
      return authErrorResponse('Unable to create account', ERROR_CODES.INTERNAL);
    }

    let studentData = null;
    if (user.role === 'STUDENT') {
      await new Promise((r) => setTimeout(r, 500));
      studentData = await UserRepository.findStudentByUserId(user.id);
    }

    const token = JWTService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refresh = await JWTService.createRefreshToken(user.id);

    return {
      success: true,
      message: 'Đăng ký thành công',
      user: toPublicUser(user),
      student: studentData
        ? {
            user_id: studentData.user_id,
            current_school: studentData.current_school ?? undefined,
            current_grade: studentData.current_grade ?? undefined,
            intended_major: studentData.intended_major ?? undefined,
            target_country: studentData.target_country ?? undefined,
            date_of_birth: studentData.date_of_birth ?? undefined,
            current_address: studentData.current_address ?? undefined,
          }
        : undefined,
      token,
      refreshToken: refresh.token,
      expiresAt: refresh.expiresAt.toISOString(),
    };
  },

  /**
   * Đăng nhập: email/password sai đều trả 401 "Invalid credentials" (tránh enumeration).
   * Trả JWT + refresh token.
   */
  async login(input: LoginInput): Promise<AuthResponse | AuthErr> {
    const user = await UserRepository.findByEmail(input.email);
    if (!user) {
      return authErrorResponse(INVALID_CREDENTIALS_MESSAGE, ERROR_CODES.INVALID_CREDENTIALS);
    }

    const provider = (user.auth_provider ?? 'LOCAL') as string;
    const canUsePassword = provider === 'LOCAL' || provider.includes('LOCAL');
    if (!canUsePassword) {
      return authErrorResponse(INVALID_CREDENTIALS_MESSAGE, ERROR_CODES.INVALID_CREDENTIALS);
    }

    if (!user.password_hash) {
      return authErrorResponse(INVALID_CREDENTIALS_MESSAGE, ERROR_CODES.INVALID_CREDENTIALS);
    }

    const valid = await UserRepository.verifyPassword(input.password, user.password_hash);
    if (!valid) {
      return authErrorResponse(INVALID_CREDENTIALS_MESSAGE, ERROR_CODES.INVALID_CREDENTIALS);
    }

    let studentData = null;
    if (user.role === 'STUDENT') {
      studentData = await UserRepository.findStudentByUserId(user.id);
    }

    const token = JWTService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refresh = await JWTService.createRefreshToken(user.id);

    return {
      success: true,
      message: 'Đăng nhập thành công',
      user: toPublicUser(user),
      student: studentData
        ? {
            user_id: studentData.user_id,
            current_school: studentData.current_school ?? undefined,
            current_grade: studentData.current_grade ?? undefined,
            intended_major: studentData.intended_major ?? undefined,
            target_country: studentData.target_country ?? undefined,
            date_of_birth: studentData.date_of_birth ?? undefined,
            current_address: studentData.current_address ?? undefined,
          }
        : undefined,
      token,
      refreshToken: refresh.token,
      expiresAt: refresh.expiresAt.toISOString(),
    };
  },

  /**
   * Thông tin tài khoản cho trang settings: email, provider, createdAt, hasPassword.
   */
  async getMe(userId: string): Promise<{ email: string; provider: string; createdAt: string | null; hasPassword: boolean } | null> {
    const user = await UserRepository.findById(userId);
    if (!user) return null;
    const provider = (user.auth_provider ?? 'LOCAL').toLowerCase();
    return {
      email: user.email,
      provider: provider.includes('google') ? 'google' : 'local',
      createdAt: user.created_at ? user.created_at.toISOString() : null,
      hasPassword: !!user.password_hash,
    };
  },

  /**
   * Đổi mật khẩu: verify JWT → so sánh oldPassword với hash → validate newPassword (schema) → hash + update.
   * Sau khi đổi: revoke toàn bộ refresh token của user.
   */
  async changePassword(
    userId: string,
    input: ChangePasswordInput
  ): Promise<AuthResponse | AuthErr> {
    const user = await UserRepository.findById(userId);
    if (!user || !user.password_hash) {
      return authErrorResponse(INVALID_CREDENTIALS_MESSAGE, ERROR_CODES.UNAUTHORIZED);
    }

    const oldValid = await UserRepository.verifyPassword(input.oldPassword, user.password_hash);
    if (!oldValid) {
      return authErrorResponse('Invalid credentials', ERROR_CODES.OLD_PASSWORD_MISMATCH);
    }

    const newHash = await bcrypt.hash(input.newPassword, BCRYPT_SALT_ROUNDS);
    const updated = await UserRepository.updatePassword(userId, newHash);
    if (!updated) {
      return authErrorResponse('Failed to update password', ERROR_CODES.INTERNAL);
    }

    await JWTService.revokeRefreshTokensForUser(userId);

    return {
      success: true,
      message: 'Password updated successfully',
      user: toPublicUser(user),
    };
  },

  /**
   * Đặt mật khẩu cho user Google chưa có password (chỉ gọi khi user không có password_hash).
   */
  async setPassword(userId: string, input: SetPasswordInput): Promise<AuthResponse | AuthErr> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      return authErrorResponse(INVALID_CREDENTIALS_MESSAGE, ERROR_CODES.UNAUTHORIZED);
    }
    if (user.password_hash) {
      return authErrorResponse('Account already has a password. Use change password instead.', ERROR_CODES.INTERNAL);
    }

    const newHash = await bcrypt.hash(input.newPassword, BCRYPT_SALT_ROUNDS);
    const updated = await UserRepository.updatePassword(userId, newHash);
    if (!updated) {
      return authErrorResponse('Failed to set password', ERROR_CODES.INTERNAL);
    }

    await JWTService.revokeRefreshTokensForUser(userId);

    return {
      success: true,
      message: 'Password set successfully',
      user: toPublicUser(user),
    };
  },

  /**
   * Xóa tài khoản: nếu user có password thì phải gửi password đúng; sau đó xóa user (cascade).
   */
  async deleteAccount(userId: string, input: DeleteAccountInput): Promise<AuthResponse | AuthErr> {
    if (!input.confirmIrreversible) {
      return authErrorResponse('You must confirm that you understand this action is irreversible.', ERROR_CODES.VALIDATION_ERROR);
    }

    const user = await UserRepository.findById(userId);
    if (!user) {
      return authErrorResponse(INVALID_CREDENTIALS_MESSAGE, ERROR_CODES.UNAUTHORIZED);
    }

    const isGoogleOnly = !user.password_hash;
    if (!isGoogleOnly) {
      const pwd = input.password?.trim();
      if (!pwd) {
        return authErrorResponse('Password is required to delete account.', ERROR_CODES.VALIDATION_ERROR);
      }
      const valid = await UserRepository.verifyPassword(pwd, user.password_hash!);
      if (!valid) {
        return authErrorResponse('Invalid credentials', ERROR_CODES.OLD_PASSWORD_MISMATCH);
      }
    }

    const deleted = await UserRepository.deleteUser(userId);
    if (!deleted) {
      return authErrorResponse('Failed to delete account', ERROR_CODES.INTERNAL);
    }

    return { success: true, message: 'Account deleted successfully' };
  },

  /**
   * Tìm / tạo / link user từ profile Google (dùng trong NextAuth OAuth flow, đã verify bởi NextAuth).
   * Trả về { id, role, student } để NextAuth gán vào token (tránh session dùng Google sub thay vì user DB).
   */
  async findOrCreateOrLinkByGoogleProfile(profile: {
    email: string;
    name?: string | null;
    sub: string;
    picture?: string | null;
  }): Promise<{ id: string; email: string; full_name: string; role: string; avatar_url?: string; student?: unknown } | null> {
    const email = UserRepository.normalizeEmail(profile.email);
    const fullName = (profile.name || profile.email || '').trim();
    const providerId = profile.sub;
    const avatarUrl = profile.picture ?? undefined;

    let user = await UserRepository.findByEmail(email);

    if (!user) {
      user = await UserRepository.createOAuthUser(email, fullName, 'GOOGLE', providerId, avatarUrl);
      if (!user) return null;
    } else {
      const provider = (user.auth_provider ?? '') as string;
      if (provider === 'GOOGLE' || provider.includes('google')) {
        // Đã có Google, dùng user hiện tại
      } else if (provider === 'LOCAL' || provider.includes('LOCAL')) {
        const linked = await DatabaseService.linkGoogleProvider(user.id, providerId);
        if (!linked) return null;
        user = await UserRepository.findById(user.id);
        if (!user) return null;
      } else {
        return null;
      }
    }

    let studentData = null;
    if (user.role === 'STUDENT') {
      studentData = await UserRepository.findStudentByUserId(user.id);
    }

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      avatar_url: user.avatar_url ?? undefined,
      student: studentData ?? undefined,
    };
  },

  /**
   * Google: verify idToken bằng Google SDK. Nếu email chưa có → tạo user (provider google).
   * Nếu email đã có → link account (thêm google) nếu chưa có provider google.
   * User Google không có password; không cho login bằng password nếu chưa set.
   */
  async googleLogin(idToken: string): Promise<AuthResponse | AuthErr> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return authErrorResponse('Google sign-in is not configured', ERROR_CODES.INTERNAL);
    }

    const client = new OAuth2Client(clientId);
    let payload: { email?: string; name?: string; sub: string; picture?: string };
    try {
      const ticket = await client.verifyIdToken({ idToken, audience: clientId });
      payload = ticket.getPayload() as { email?: string; name?: string; sub: string; picture?: string };
    } catch {
      return authErrorResponse('Invalid Google token', ERROR_CODES.GOOGLE_VERIFY_FAILED);
    }

    if (!payload?.email) {
      return authErrorResponse('Invalid Google token', ERROR_CODES.GOOGLE_VERIFY_FAILED);
    }

    const resolved = await this.findOrCreateOrLinkByGoogleProfile({
      email: payload.email,
      name: payload.name,
      sub: payload.sub,
      picture: payload.picture,
    });

    if (!resolved) {
      return authErrorResponse('Invalid credentials', ERROR_CODES.INVALID_CREDENTIALS);
    }

    const token = JWTService.generateToken({
      userId: resolved.id,
      email: resolved.email,
      role: resolved.role as UserRole,
    });
    const refresh = await JWTService.createRefreshToken(resolved.id);

    return {
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        id: resolved.id,
        email: resolved.email,
        full_name: resolved.full_name,
        role: resolved.role as UserRole,
        avatar_url: resolved.avatar_url,
      },
      student: resolved.student
        ? {
            user_id: (resolved.student as { user_id: string }).user_id,
            current_school: (resolved.student as { current_school?: string | null }).current_school ?? undefined,
            current_grade: (resolved.student as { current_grade?: string | null }).current_grade ?? undefined,
            intended_major: (resolved.student as { intended_major?: string | null }).intended_major ?? undefined,
            target_country: (resolved.student as { target_country?: string | null }).target_country ?? undefined,
            date_of_birth: (resolved.student as { date_of_birth?: Date | null }).date_of_birth ?? undefined,
            current_address: (resolved.student as { current_address?: string | null }).current_address ?? undefined,
          }
        : undefined,
      token,
      refreshToken: refresh.token,
      expiresAt: refresh.expiresAt.toISOString(),
    };
  },

  async verifyToken(token: string): Promise<AuthResponse | AuthErr> {
    const payload = JWTService.verifyToken(token);
    if (!payload) {
      return authErrorResponse('Invalid token', ERROR_CODES.INVALID_TOKEN);
    }
    const user = await UserRepository.findById(payload.userId);
    if (!user) {
      return authErrorResponse('User not found', ERROR_CODES.INVALID_TOKEN);
    }
    return {
      success: true,
      user: toPublicUser(user),
      token,
    };
  },
};
