import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { authErrorResponse, ERROR_CODES } from '@/lib/auth/errors';

/**
 * Parse body JSON và validate bằng schema. Trả lỗi chuẩn nếu fail.
 */
export async function withValidation<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      error: NextResponse.json(
        authErrorResponse('Invalid JSON body', ERROR_CODES.VALIDATION_ERROR),
        { status: 400 }
      ),
    };
  }

  const result = schema.safeParse(body);
  if (result.success) {
    return { data: result.data };
  }

  const err = result.error as ZodError & { issues?: Array<{ path: (string | number)[]; message?: string }> };
  const issues = err.issues ?? [];
  const first = issues[0];
  const message = first ? `${(first.path ?? []).join('.')}: ${first.message ?? 'Invalid'}` : 'Validation failed';
  return {
    error: NextResponse.json(
      authErrorResponse(message, ERROR_CODES.VALIDATION_ERROR),
      { status: 400 }
    ),
  };
}
