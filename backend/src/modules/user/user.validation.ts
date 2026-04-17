import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
  phone: z.string().max(20).optional(),
  dateOfBirth: z.string().datetime().optional(),
  preferredLang: z.enum(['en', 'hi', 'te', 'ta']).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
