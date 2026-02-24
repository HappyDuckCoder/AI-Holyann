import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '@/lib/services/jwt.service';
import { authErrorResponse, ERROR_CODES } from '@/lib/auth/errors';

export function getBearerUserId(request: NextRequest): string | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const payload = JWTService.verifyToken(token);
  return payload?.userId ?? null;
}

/**
 * Trả về NextResponse lỗi 401 nếu không có JWT hợp lệ.
 * Dùng trong route: const userId = await requireAuth(request); if (userId === null) return response;
 */
export async function requireAuth(request: NextRequest): Promise<{ userId: string } | { error: NextResponse }> {
  const userId = getBearerUserId(request);
  if (!userId) {
    return {
      error: NextResponse.json(
        authErrorResponse('Unauthorized', ERROR_CODES.UNAUTHORIZED),
        { status: 401 }
      ),
    };
  }
  return { userId };
}
