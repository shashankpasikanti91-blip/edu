// ──────────────────────────────────────────────────────────────
// Boundary Box System — User Intent Resolver
// ──────────────────────────────────────────────────────────────
// Every request passes through 5 boxes before generating answers:
// BOX 1: User Type | BOX 2: Domain | BOX 3: Standard | BOX 4: Output Mode | BOX 5: Difficulty

export type UserType =
  | 'student'
  | 'aspirant'
  | 'medical'
  | 'professional'
  | 'institution'
  | 'industry'
  | 'ngo';

export type Domain =
  | 'education'
  | 'current_affairs'
  | 'medical'
  | 'finance'
  | 'engineering'
  | 'it'
  | 'government'
  | 'general_knowledge';

export type LearningStandard = 'indian' | 'international' | 'hybrid';

export type OutputMode =
  | 'learn'
  | 'summary'
  | 'quiz'
  | 'mcq'
  | 'exam_answer'
  | 'case_study'
  | 'compare'
  | 'revision';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface BoundaryContext {
  userType: UserType;
  domain: Domain;
  standard: LearningStandard;
  outputMode: OutputMode;
  difficulty: DifficultyLevel;
  needsLatestInfo: boolean;
  needsExamFormat: boolean;
}

// ──────────────────────────────────────────────────────────────
// Resolve intent from request parameters
// ──────────────────────────────────────────────────────────────

export function resolveUserIntent(params: {
  userType?: string;
  domain?: string;
  standard?: string;
  outputMode?: string;
  difficulty?: string;
  examType?: string;
  module?: string;
  educationLevel?: string;
}): BoundaryContext {
  const userType = resolveUserType(params.userType, params.module, params.examType);
  const domain = resolveDomain(params.domain, params.module);
  const standard = resolveStandard(params.standard, params.examType);
  const outputMode = resolveOutputMode(params.outputMode, params.module);
  const difficulty = resolveDifficulty(params.difficulty, params.educationLevel);

  const needsLatestInfo = domain === 'current_affairs' || params.module === 'current_affairs';
  const needsExamFormat = userType === 'aspirant' || !!params.examType;

  return { userType, domain, standard, outputMode, difficulty, needsLatestInfo, needsExamFormat };
}

function resolveUserType(userType?: string, module?: string, examType?: string): UserType {
  if (userType && isValidUserType(userType)) return userType;

  if (module === 'medical_learning') return 'medical';
  if (module === 'industry_learning') return 'industry';
  if (module === 'engineering_learning') return 'student';
  if (module === 'commerce_learning') return 'student';

  const aspirantExams = ['UPSC', 'SSC', 'Banking', 'RRB', 'State PSC', 'CUET', 'GATE', 'NDA', 'CDS', 'CA', 'CS', 'CMA'];
  if (examType && aspirantExams.some(e => examType.toUpperCase().includes(e))) return 'aspirant';

  return 'student';
}

function resolveDomain(domain?: string, module?: string): Domain {
  if (domain && isValidDomain(domain)) return domain;

  const moduleMap: Record<string, Domain> = {
    study_assistant: 'education',
    current_affairs: 'current_affairs',
    medical_learning: 'medical',
    industry_learning: 'engineering',
    engineering_learning: 'engineering',
    commerce_learning: 'finance',
  };

  return moduleMap[module || ''] || 'education';
}

function resolveStandard(standard?: string, examType?: string): LearningStandard {
  if (standard && isValidStandard(standard)) return standard;

  const indianExams = ['UPSC', 'SSC', 'Banking', 'RRB', 'State PSC', 'CUET', 'NEET', 'JEE', 'GATE', 'CA', 'CS', 'CMA', 'EAMCET', 'KCET'];
  if (examType && indianExams.some(e => examType.toUpperCase().includes(e))) return 'indian';

  const internationalExams = ['USMLE', 'NCLEX', 'IELTS', 'TOEFL', 'GRE', 'SAT'];
  if (examType && internationalExams.some(e => examType.toUpperCase().includes(e))) return 'international';

  return 'indian';
}

function resolveOutputMode(outputMode?: string, module?: string): OutputMode {
  if (outputMode && isValidOutputMode(outputMode)) return outputMode;
  return 'learn';
}

function resolveDifficulty(difficulty?: string, educationLevel?: string): DifficultyLevel {
  if (difficulty && isValidDifficulty(difficulty)) return difficulty;

  const lev = (educationLevel || '').toUpperCase();
  if (['PRIMARY', 'MIDDLE_SCHOOL'].includes(lev)) return 'beginner';
  if (['HIGH_SCHOOL', 'SENIOR_SECONDARY'].includes(lev)) return 'intermediate';
  if (['DIPLOMA', 'UG', 'SKILL_VOCATIONAL'].includes(lev)) return 'advanced';
  if (['PG', 'DOCTORAL', 'PROFESSIONAL', 'COMPETITIVE_EXAM'].includes(lev)) return 'expert';

  return 'intermediate';
}

// ──────────────────────────────────────────────────────────────
// Prompt section builder
// ──────────────────────────────────────────────────────────────

export function buildBoundaryContextPrompt(ctx: BoundaryContext): string {
  return `
BOUNDARY CONTEXT:
- User Type: ${ctx.userType.toUpperCase()}
- Domain: ${ctx.domain.toUpperCase().replace(/_/g, ' ')}
- Standard: ${ctx.standard.toUpperCase()}
- Output Mode: ${ctx.outputMode.toUpperCase().replace(/_/g, ' ')}
- Difficulty: ${ctx.difficulty.toUpperCase()}
- Requires Latest Info: ${ctx.needsLatestInfo ? 'YES' : 'NO'}
- Exam Format Required: ${ctx.needsExamFormat ? 'YES' : 'NO'}

SCOPE RULES:
- Stay STRICTLY within the ${ctx.domain.replace(/_/g, ' ')} domain.
- Do NOT mix unrelated domains in the response.
- Tailor language and depth to ${ctx.difficulty} level.
- ${ctx.standard === 'indian' ? 'Use Indian standards, references, and examples.' : ctx.standard === 'international' ? 'Use international standards and global references.' : 'Blend Indian and international perspectives.'}
- ${ctx.needsExamFormat ? 'Structure content in exam-ready format with marking guidelines.' : 'Structure content for clear learning and understanding.'}`;
}

// ──────────────────────────────────────────────────────────────
// Validation helpers
// ──────────────────────────────────────────────────────────────

const VALID_USER_TYPES: UserType[] = ['student', 'aspirant', 'medical', 'professional', 'institution', 'industry', 'ngo'];
const VALID_DOMAINS: Domain[] = ['education', 'current_affairs', 'medical', 'finance', 'engineering', 'it', 'government', 'general_knowledge'];
const VALID_STANDARDS: LearningStandard[] = ['indian', 'international', 'hybrid'];
const VALID_OUTPUT_MODES: OutputMode[] = ['learn', 'summary', 'quiz', 'mcq', 'exam_answer', 'case_study', 'compare', 'revision'];
const VALID_DIFFICULTIES: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];

function isValidUserType(v: string): v is UserType { return VALID_USER_TYPES.includes(v as UserType); }
function isValidDomain(v: string): v is Domain { return VALID_DOMAINS.includes(v as Domain); }
function isValidStandard(v: string): v is LearningStandard { return VALID_STANDARDS.includes(v as LearningStandard); }
function isValidOutputMode(v: string): v is OutputMode { return VALID_OUTPUT_MODES.includes(v as OutputMode); }
function isValidDifficulty(v: string): v is DifficultyLevel { return VALID_DIFFICULTIES.includes(v as DifficultyLevel); }

export function validateBoundaryRequest(params: {
  userType?: string;
  domain?: string;
  standard?: string;
  outputMode?: string;
  difficulty?: string;
}): string[] {
  const errors: string[] = [];
  if (params.userType && !isValidUserType(params.userType)) {
    errors.push(`Invalid userType "${params.userType}". Must be one of: ${VALID_USER_TYPES.join(', ')}`);
  }
  if (params.domain && !isValidDomain(params.domain)) {
    errors.push(`Invalid domain "${params.domain}". Must be one of: ${VALID_DOMAINS.join(', ')}`);
  }
  if (params.standard && !isValidStandard(params.standard)) {
    errors.push(`Invalid standard "${params.standard}". Must be one of: ${VALID_STANDARDS.join(', ')}`);
  }
  if (params.outputMode && !isValidOutputMode(params.outputMode)) {
    errors.push(`Invalid outputMode "${params.outputMode}". Must be one of: ${VALID_OUTPUT_MODES.join(', ')}`);
  }
  if (params.difficulty && !isValidDifficulty(params.difficulty)) {
    errors.push(`Invalid difficulty "${params.difficulty}". Must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
  }
  return errors;
}
