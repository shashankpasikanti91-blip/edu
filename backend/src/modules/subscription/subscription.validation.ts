import { z } from 'zod';

export const createPlanSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  category: z.enum(['STUDENT', 'INSTITUTION']),
  price: z.number().min(0),
  yearlyPrice: z.number().min(0).optional(),
  currency: z.string().default('INR'),
  interval: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
  maxUsers: z.number().int().min(1).default(50),
  maxStorage: z.number().int().min(0).default(1073741824),
  maxAiCredits: z.number().int().min(0).default(100),
  features: z.record(z.unknown()).optional(),
  brandingTier: z.enum(['BASIC', 'STANDARD', 'PREMIUM', 'WHITE_LABEL']).default('BASIC'),
  trialDays: z.number().int().min(0).default(0),
  sortOrder: z.number().int().default(0),
  isPopular: z.boolean().default(false),
});

export const updatePlanSchema = createPlanSchema.partial().omit({ slug: true });

export const createSubscriptionSchema = z.object({
  tenantId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  planId: z.string().uuid(),
  paymentProvider: z.enum(['RAZORPAY', 'STRIPE', 'MANUAL']).optional(),
  couponCode: z.string().optional(),
});

export const renewSubscriptionSchema = z.object({
  paymentProvider: z.enum(['RAZORPAY', 'STRIPE', 'MANUAL']).optional(),
  couponCode: z.string().optional(),
});

export const upgradeSubscriptionSchema = z.object({
  planId: z.string().uuid(),
  paymentProvider: z.enum(['RAZORPAY', 'STRIPE', 'MANUAL']).optional(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
