import { z } from 'zod';
import isEmail from 'validator/lib/isEmail';

const PASSWORD_MIN_LENGTH = 8;
const passwordRegex = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /\d/,
  special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
};

/** Email: normalize (lowercase + trim) + validate RFC bằng validator */
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .transform((v) => v.toLowerCase())
  .refine((v) => isEmail(v), 'Invalid email format');

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .refine((v) => passwordRegex.uppercase.test(v), 'Password must contain at least one uppercase letter')
  .refine((v) => passwordRegex.lowercase.test(v), 'Password must contain at least one lowercase letter')
  .refine((v) => passwordRegex.number.test(v), 'Password must contain at least one number')
  .refine((v) => passwordRegex.special.test(v), 'Password must contain at least one special character');

export const registerSchema = z.object({
  full_name: z.string().trim().min(1, 'Full name is required').max(100),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['STUDENT', 'MENTOR', 'ADMIN']).optional().default('STUDENT'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

/** Cho user đăng nhập Google chưa có password – chỉ cần newPassword */
export const setPasswordSchema = z.object({
  newPassword: passwordSchema,
});

export const googleIdTokenSchema = z.object({
  idToken: z.string().min(1, 'idToken is required'),
});

/** Xóa tài khoản: password để xác nhận (bỏ qua nếu Google-only), checkbox đã đọc */
export const deleteAccountSchema = z.object({
  password: z.string().optional(),
  confirmIrreversible: z.literal(true, { message: 'Bạn phải xác nhận hiểu hành động này không thể hoàn tác' }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
export type GoogleIdTokenInput = z.infer<typeof googleIdTokenSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
