import { z } from 'zod';

// ──────────────────────────────────────────────────────────────
// Study Assistant Validation
// ──────────────────────────────────────────────────────────────

export const studyAssistantQuerySchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(10000),
  mode: z.enum([
    'default', 'explain_topic', 'solve_step_by_step',
    'exam_answer', 'table_compare', 'memory_tricks', 'diagram_summary',
    'revision_notes', 'quick_quiz',
  ]).default('default'),
  answerStandard: z.enum(['indian', 'international', 'neutral', 'hybrid']).optional(),
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
    'revision_notes', 'quick_quiz',
  ]).optional(),
  answerStandard: z.enum(['indian', 'international', 'neutral', 'hybrid']).optional(),
  educationLevel: z.string().max(100).optional(),
  grade: z.string().max(50).optional(),
});

// ──────────────────────────────────────────────────────────────
// Current Affairs Validation
// ──────────────────────────────────────────────────────────────

const VALID_CATEGORIES = [
  'National', 'International', 'Economy', 'Science & Technology',
  'Sports', 'Awards & Honours', 'Government Schemes', 'Environment', 'Defence',
  'Medical & Healthcare', 'Industry Updates', 'Education Updates', 'Mixed',
] as const;

const VALID_EXAM_TYPES = [
  'General', 'UPSC', 'SSC', 'Banking', 'RRB', 'State PSC', 'CUET',
  'Medical', 'Professional',
] as const;

const VALID_OUTPUT_FORMATS = [
  'comprehensive', 'qa_only', 'bullet_points', 'memory_points', 'mini_quiz',
  'mcq_practice', 'editorial_summary',
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
  answerStandard: z.enum(['indian', 'international', 'neutral', 'hybrid']).optional(),
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

// ──────────────────────────────────────────────────────────────
// Medical Learning Validation
// ──────────────────────────────────────────────────────────────

const VALID_MEDICAL_MODES = [
  'explain_condition', 'anatomy_learning', 'drug_basics', 'procedure_overview',
  'quiz_mode', 'certification_prep', 'case_discussion', 'sop_learning',
] as const;

const VALID_MEDICAL_USER_LEVELS = [
  'nursing_student', 'staff_nurse', 'icu_nurse', 'mbbs_student',
  'doctor', 'surgeon', 'allied_health', 'hospital_admin',
] as const;

export const medicalLearningSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(500),
  mode: z.string().optional().refine(
    (val) => !val || VALID_MEDICAL_MODES.includes(val as any),
    { message: `Mode must be one of: ${VALID_MEDICAL_MODES.join(', ')}` }
  ),
  medicalUserLevel: z.string().optional().refine(
    (val) => !val || VALID_MEDICAL_USER_LEVELS.includes(val as any),
    { message: `Medical user level must be one of: ${VALID_MEDICAL_USER_LEVELS.join(', ')}` }
  ),
  standard: z.enum(['indian', 'international', 'hybrid']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  examType: z.string().max(100).optional(),
  specialization: z.string().max(200).optional(),
});

// ──────────────────────────────────────────────────────────────
// Industry Learning Validation
// ──────────────────────────────────────────────────────────────

const VALID_INDUSTRY_MODES = [
  'sop_explanation', 'safety_learning', 'technical_basics',
  'compliance_summary', 'process_training', 'quick_quiz',
] as const;

const VALID_INDUSTRY_SECTORS = [
  'metal', 'engineering', 'it_software', 'finance', 'hr',
  'manufacturing', 'safety', 'corporate', 'general',
] as const;

export const industryLearningSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(500),
  mode: z.string().optional().refine(
    (val) => !val || VALID_INDUSTRY_MODES.includes(val as any),
    { message: `Mode must be one of: ${VALID_INDUSTRY_MODES.join(', ')}` }
  ),
  sector: z.string().optional().refine(
    (val) => !val || VALID_INDUSTRY_SECTORS.includes(val as any),
    { message: `Sector must be one of: ${VALID_INDUSTRY_SECTORS.join(', ')}` }
  ),
  standard: z.enum(['indian', 'international', 'hybrid']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  role: z.string().max(200).optional(),
});

// ──────────────────────────────────────────────────────────────
// Engineering Learning Validation
// ──────────────────────────────────────────────────────────────

const VALID_ENGINEERING_MODES = [
  'concept_explain', 'solve_numericals', 'lab_viva_prep', 'design_problems',
  'formula_revision', 'quiz_mode', 'gate_prep', 'project_guidance', 'coding_practice',
] as const;

const VALID_ENGINEERING_BRANCHES = [
  'cse', 'ece', 'eee', 'mechanical', 'civil', 'it',
  'chemical', 'marine', 'aerospace', 'automobile', 'biomedical', 'general',
] as const;

const VALID_ENGINEERING_USER_LEVELS = [
  'class_10', 'class_11_12', 'diploma', 'btech_1_2',
  'btech_3_4', 'mtech', 'gate_aspirant', 'working_engineer',
] as const;

export const engineeringLearningSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(500),
  mode: z.string().optional().refine(
    (val) => !val || VALID_ENGINEERING_MODES.includes(val as any),
    { message: `Mode must be one of: ${VALID_ENGINEERING_MODES.join(', ')}` }
  ),
  branch: z.string().optional().refine(
    (val) => !val || VALID_ENGINEERING_BRANCHES.includes(val as any),
    { message: `Branch must be one of: ${VALID_ENGINEERING_BRANCHES.join(', ')}` }
  ),
  userLevel: z.string().optional().refine(
    (val) => !val || VALID_ENGINEERING_USER_LEVELS.includes(val as any),
    { message: `User level must be one of: ${VALID_ENGINEERING_USER_LEVELS.join(', ')}` }
  ),
  standard: z.enum(['indian', 'international', 'hybrid']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  examType: z.string().max(100).optional(),
  semester: z.string().max(50).optional(),
});

// ──────────────────────────────────────────────────────────────
// Commerce & CA Learning Validation
// ──────────────────────────────────────────────────────────────

const VALID_COMMERCE_MODES = [
  'concept_explain', 'solve_problems', 'case_study', 'exam_prep',
  'standards_learning', 'tax_computation', 'audit_learning', 'quiz_mode',
] as const;

const VALID_COMMERCE_USER_LEVELS = [
  'class_11_12', 'bcom', 'bba', 'ca_foundation', 'ca_inter', 'ca_final',
  'cs_student', 'cma_student', 'mcom', 'mba_finance',
] as const;

const VALID_COMMERCE_SPECIALIZATIONS = [
  'accountancy', 'cost_accounting', 'taxation', 'auditing', 'corporate_law',
  'economics', 'financial_management', 'business_studies', 'statistics', 'general',
] as const;

export const commerceLearningSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(500),
  mode: z.string().optional().refine(
    (val) => !val || VALID_COMMERCE_MODES.includes(val as any),
    { message: `Mode must be one of: ${VALID_COMMERCE_MODES.join(', ')}` }
  ),
  userLevel: z.string().optional().refine(
    (val) => !val || VALID_COMMERCE_USER_LEVELS.includes(val as any),
    { message: `User level must be one of: ${VALID_COMMERCE_USER_LEVELS.join(', ')}` }
  ),
  specialization: z.string().optional().refine(
    (val) => !val || VALID_COMMERCE_SPECIALIZATIONS.includes(val as any),
    { message: `Specialization must be one of: ${VALID_COMMERCE_SPECIALIZATIONS.join(', ')}` }
  ),
  standard: z.enum(['indian', 'international', 'hybrid']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  examType: z.string().max(100).optional(),
});

// ──────────────────────────────────────────────────────────────
// Type Exports
// ──────────────────────────────────────────────────────────────

export type StudyAssistantQueryInput = z.infer<typeof studyAssistantQuerySchema>;
export type StudyAssistantChatMessageInput = z.infer<typeof studyAssistantChatMessageSchema>;
export type CurrentAffairsGenerateInput = z.infer<typeof currentAffairsGenerateSchema>;
export type MedicalLearningInput = z.infer<typeof medicalLearningSchema>;
export type IndustryLearningInput = z.infer<typeof industryLearningSchema>;
export type EngineeringLearningInput = z.infer<typeof engineeringLearningSchema>;
export type CommerceLearningInput = z.infer<typeof commerceLearningSchema>;
