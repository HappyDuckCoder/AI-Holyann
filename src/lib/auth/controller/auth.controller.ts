import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service/auth.service';
import { withValidation } from '@/lib/auth/middleware/validate';
import { checkRateLimit } from '@/lib/auth/middleware/rate-limit';
import { requireAuth } from '@/lib/auth/middleware/require-auth';
import { registerSchema, loginSchema, changePasswordSchema, setPasswordSchema, deleteAccountSchema, googleIdTokenSchema } from '@/lib/auth/validator/schemas';
import { authErrorResponse, ERROR_CODES } from '@/lib/auth/errors';

function json(data: object, status = 200) {
  return NextResponse.json(data, { status });
}

function isAuthError(
  result: unknown
): result is { success: false; message: string; code: string } {
  return (
    typeof result === 'object' &&
    result !== null &&
    'success' in result &&
    (result as { success: boolean }).success === false &&
    'code' in result
  );
}

export const AuthController = {
  async register(request: NextRequest) {
    const limit = checkRateLimit(request, 'register');
    if (!limit.allowed) {
      return json(
        authErrorResponse('Too many requests. Try again later.', ERROR_CODES.RATE_LIMIT),
        429
      );
    }

    const parsed = await withValidation(request, registerSchema);
    if ('error' in parsed) return parsed.error;

    const result = await AuthService.register(parsed.data);
    if (isAuthError(result)) {
      if (result.code === ERROR_CODES.EMAIL_IN_USE) {
        return json(result, 409);
      }
      return json(result, 400);
    }

    const { token, refreshToken, expiresAt, ...rest } = result;
    return json({ ...rest, token, refreshToken, expiresAt });
  },

  async login(request: NextRequest) {
    const limit = checkRateLimit(request, 'login');
    if (!limit.allowed) {
      return json(
        authErrorResponse('Too many requests. Try again later.', ERROR_CODES.RATE_LIMIT),
        429
      );
    }

    const parsed = await withValidation(request, loginSchema);
    if ('error' in parsed) return parsed.error;

    const result = await AuthService.login(parsed.data);
    if (isAuthError(result)) {
      return json(authErrorResponse('Invalid credentials', ERROR_CODES.INVALID_CREDENTIALS), 401);
    }

    const { token, refreshToken, expiresAt, ...rest } = result;
    return json({ ...rest, token, refreshToken, expiresAt });
  },

  async changePassword(request: NextRequest) {
    const auth = await requireAuth(request);
    if ('error' in auth) return auth.error;

    const parsed = await withValidation(request, changePasswordSchema);
    if ('error' in parsed) return parsed.error;

    const result = await AuthService.changePassword(auth.userId, parsed.data);
    if (isAuthError(result)) {
      if (result.code === ERROR_CODES.OLD_PASSWORD_MISMATCH || result.code === ERROR_CODES.UNAUTHORIZED) {
        return json(authErrorResponse('Invalid credentials', ERROR_CODES.INVALID_CREDENTIALS), 401);
      }
      return json(result, 400);
    }

    return json(result);
  },

  async setPassword(request: NextRequest) {
    const auth = await requireAuth(request);
    if ('error' in auth) return auth.error;

    const parsed = await withValidation(request, setPasswordSchema);
    if ('error' in parsed) return parsed.error;

    const result = await AuthService.setPassword(auth.userId, parsed.data);
    if (isAuthError(result)) {
      return json(result, 400);
    }
    return json(result);
  },

  async deleteAccount(request: NextRequest) {
    const auth = await requireAuth(request);
    if ('error' in auth) return auth.error;

    const parsed = await withValidation(request, deleteAccountSchema);
    if ('error' in parsed) return parsed.error;

    const result = await AuthService.deleteAccount(auth.userId, parsed.data);
    if (isAuthError(result)) {
      if (result.code === ERROR_CODES.OLD_PASSWORD_MISMATCH || result.code === ERROR_CODES.UNAUTHORIZED) {
        return json(authErrorResponse('Invalid credentials', ERROR_CODES.INVALID_CREDENTIALS), 401);
      }
      return json(result, 400);
    }
    return json(result);
  },

  async getMe(request: NextRequest) {
    const auth = await requireAuth(request);
    if ('error' in auth) return auth.error;

    const user = await AuthService.getMe(auth.userId);
    if (!user) {
      return json(authErrorResponse('User not found', ERROR_CODES.UNAUTHORIZED), 401);
    }
    return json(user);
  },

  async google(request: NextRequest) {
    const limit = checkRateLimit(request, 'auth');
    if (!limit.allowed) {
      return json(
        authErrorResponse('Too many requests. Try again later.', ERROR_CODES.RATE_LIMIT),
        429
      );
    }

    const parsed = await withValidation(request, googleIdTokenSchema);
    if ('error' in parsed) return parsed.error;

    const result = await AuthService.googleLogin(parsed.data.idToken);
    if (isAuthError(result)) {
      if (result.code === ERROR_CODES.GOOGLE_VERIFY_FAILED) {
        return json(result, 401);
      }
      return json(result, 400);
    }

    const { token, refreshToken, expiresAt, ...rest } = result;
    return json({ ...rest, token, refreshToken, expiresAt });
  },
};
