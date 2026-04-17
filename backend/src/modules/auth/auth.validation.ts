import { z } from 'zod';

export const signupSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .max(255)
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100)
    .trim(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100)
    .trim(),
  role: z
    .enum(['STUDENT', 'PARENT', 'TEACHER', 'DEPARTMENT_ADMIN', 'INSTITUTION_ADMIN', 'INSTITUTION_OWNER'])
    .default('STUDENT'),
  tenantId: z.string().uuid().optional(),
  // B2C student optional fields
  grade: z.string().max(50).optional(),
  goal: z.string().max(500).optional(),
  courseName: z.string().max(100).optional(),
  referralCode: z.string().max(50).optional(),
  preferredLang: z.string().max(10).optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .uuid('Invalid refresh token'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .transform((v) => v.toLowerCase().trim()),
});

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

export const verifyEmailSchema = z.object({
  token: z
    .string()
    .min(1, 'Verification token is required'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
