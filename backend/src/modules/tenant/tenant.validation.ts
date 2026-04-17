import { z } from 'zod';

export const createTenantSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Institution name must be at least 2 characters').max(200),
    type: z.enum(['SCHOOL', 'COLLEGE', 'UNIVERSITY', 'COACHING_INSTITUTE', 'TRAINING_CENTER']),
    slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().max(20).optional(),
    address: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    country: z.string().max(100).optional(),
    website: z.string().url('Invalid website URL').optional(),
  }),
});

export const updateTenantSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200).optional(),
    email: z.string().email().optional(),
    phone: z.string().max(20).optional(),
    address: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    country: z.string().max(100).optional(),
    website: z.string().url().optional(),
    logoUrl: z.string().url().optional(),
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color').optional(),
  }),
});

export const updateTenantSettingsSchema = z.object({
  body: z.object({
    allowStudentSignup: z.boolean().optional(),
    requireApproval: z.boolean().optional(),
    allowParentAccess: z.boolean().optional(),
    enableAiAssistant: z.boolean().optional(),
    maxStudents: z.number().int().positive().optional(),
    maxTeachers: z.number().int().positive().optional(),
    academicYear: z.string().max(20).optional(),
    timezone: z.string().max(50).optional(),
    dateFormat: z.string().max(20).optional(),
  }),
});

export const tenantIdParamSchema = z.object({
  params: z.object({
    tenantId: z.string().uuid('Invalid tenant ID'),
  }),
});
