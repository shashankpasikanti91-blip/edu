import { z } from 'zod';

// ──────────────────────────────────────────────────────────────
// Study Assistant Validation
// ──────────────────────────────────────────────────────────────

export const studyAssistantQuerySchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(10000),
  mode: z.enum([
    'default', 'explain_topic', 'solve_step_by_step',
    'exam_answer', 'table_compare', 'memory_tricks', 'diagram_summary',
  ]).default('default'),
  answerStandard: z.enum(['indian', 'international', 'neutral']).optional(),
  subject: z.string().max(200).optional(),
  board: z.string().max(100).optional(),
  educationLevel: z.string().max(100).optional(),
  grade: z.string().max(50).optional(),
});

export const studyAssistantChatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(10000),
  mode: z.enum([
    'default', 'explain_topic', 'solve_step_by_step',
    'exam_answer', 'table_compare', 'memory_tricks', 'diagram_summary',
  ]).optional(),
  answerStandard: z.enum(['indian', 'international', 'neutral']).optional(),
  educationLevel: z.string().max(100).optional(),
  grade: z.string().max(50).optional(),
});

// ──────────────────────────────────────────────────────────────
// Current Affairs Validation
// ──────────────────────────────────────────────────────────────

const VALID_CATEGORIES = [
  'National', 'International', 'Economy', 'Science & Technology',
  'Sports', 'Awards & Honours', 'Government Schemes', 'Environment', 'Defence',
] as const;

const VALID_EXAM_TYPES = [
  'General', 'UPSC', 'SSC', 'Banking', 'RRB', 'State PSC', 'CUET',
] as const;

const VALID_OUTPUT_FORMATS = [
  'comprehensive', 'qa_only', 'bullet_points', 'memory_points', 'mini_quiz',
] as const;

const VALID_DATE_RANGES = [
  'last_7_days', 'last_30_days', 'this_month', 'custom',
] as const;

export const currentAffairsGenerateSchema = z.object({
  category: z.string().optional().refine(
    (val) => !val || VALID_CATEGORIES.includes(val as any),
    { message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}` }
  ),
  examType: z.string().optional().refine(
    (val) => !val || VALID_EXAM_TYPES.includes(val as any),
    { message: `Exam type must be one of: ${VALID_EXAM_TYPES.join(', ')}` }
  ),
  outputFormat: z.string().optional().refine(
    (val) => !val || VALID_OUTPUT_FORMATS.includes(val as any),
    { message: `Output format must be one of: ${VALID_OUTPUT_FORMATS.join(', ')}` }
  ),
  dateRange: z.string().optional().refine(
    (val) => !val || VALID_DATE_RANGES.includes(val as any),
    { message: `Date range must be one of: ${VALID_DATE_RANGES.join(', ')}` }
  ),
  customStartDate: z.string().optional(),
  customEndDate: z.string().optional(),
  answerStandard: z.enum(['indian', 'international', 'neutral']).optional(),
  topic: z.string().max(500).optional(),
  count: z.number().int().min(1).max(20).optional(),
  educationLevel: z.string().max(100).optional(),
  grade: z.string().max(50).optional(),
}).refine(
  (data) => {
    // If dateRange is custom, require both dates
    if (data.dateRange === 'custom') {
      return !!data.customStartDate && !!data.customEndDate;
    }
    return true;
  },
  { message: 'Custom date range requires both customStartDate and customEndDate', path: ['dateRange'] }
);

export type StudyAssistantQueryInput = z.infer<typeof studyAssistantQuerySchema>;
export type StudyAssistantChatMessageInput = z.infer<typeof studyAssistantChatMessageSchema>;
export type CurrentAffairsGenerateInput = z.infer<typeof currentAffairsGenerateSchema>;
