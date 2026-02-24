/**
 * Chuẩn hóa error response cho auth APIs.
 * Format: { success: false, message: string, code: string }
 */
export const ERROR_CODES = {
  EMAIL_IN_USE: 'EMAIL_ALREADY_IN_USE',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_TOKEN: 'INVALID_TOKEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  OLD_PASSWORD_MISMATCH: 'OLD_PASSWORD_MISMATCH',
  GOOGLE_VERIFY_FAILED: 'GOOGLE_VERIFY_FAILED',
  INTERNAL: 'INTERNAL_ERROR',
} as const;

export type AuthErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export interface AuthErrorResponse {
  success: false;
  message: string;
  code: AuthErrorCode;
}

export function authErrorResponse(message: string, code: AuthErrorCode): AuthErrorResponse {
  return { success: false, message, code };
}
