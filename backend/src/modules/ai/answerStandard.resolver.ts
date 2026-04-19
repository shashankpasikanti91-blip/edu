export type AnswerStandard = 'indian' | 'international' | 'neutral' | 'hybrid';

export interface StandardContext {
  standard: AnswerStandard;
  languageStyle: string;
  framingGuidance: string;
  examplePreference: string;
}

const STANDARD_CONFIGS: Record<AnswerStandard, StandardContext> = {
  indian: {
    standard: 'indian',
    languageStyle: 'Indian English (use spellings like "colour", "honour", "programme", "organisation" where applicable)',
    framingGuidance: `- Use Indian academic framing and Indian syllabus references (CBSE, ICSE, State Board, NCERT)
- Reference Indian institutions, bodies, and authorities (RBI, SEBI, NITI Aayog, Parliament, Supreme Court, etc.)
- For polity, use Indian Constitution, Indian Parliament, Indian judiciary system
- For economy, use Indian context (GDP growth, Union Budget, Five Year Plans, GST, monetary policy by RBI)
- For geography, use Indian geography first (rivers, states, climate zones, natural resources)
- For history, use Indian history and freedom struggle context
- For science, reference Indian achievements (ISRO, DRDO, CSIR, IITs)
- For medical, reference Indian medical standards (NMC, INC, Indian Pharmacopoeia, NABH)
- For industry, reference Indian standards (BIS, Factories Act, DGMS, FSSAI)
- Avoid US/UK classroom tone; use formal Indian academic tone
- When explaining social concepts, use Indian examples (caste system, panchayati raj, cooperative federalism)`,
    examplePreference: 'Use Indian examples first — Indian cities, Indian institutions, Indian policies, Indian historical events. Only use international examples when specifically relevant or when no Indian example exists.',
  },
  international: {
    standard: 'international',
    languageStyle: 'Standard international English',
    framingGuidance: `- Use globally recognised academic framing
- Reference international institutions (UN, WHO, World Bank, IMF)
- Keep content neutral to any specific country's curriculum
- Use examples from multiple countries
- For medical, use WHO/CDC/NHS guidelines, USMLE/NCLEX standards
- For industry, use ISO standards, OSHA guidelines, global best practices
- Follow widely accepted academic conventions`,
    examplePreference: 'Use diverse international examples from multiple countries and contexts.',
  },
  neutral: {
    standard: 'neutral',
    languageStyle: 'Clear, simple English without regional bias',
    framingGuidance: `- Keep content factual and curriculum-neutral
- Do not favour any specific country's framing
- Present information objectively
- Use universal academic conventions`,
    examplePreference: 'Use the most appropriate examples regardless of geography. Keep examples universally understandable.',
  },
  hybrid: {
    standard: 'hybrid',
    languageStyle: 'Clear English blending Indian and international conventions',
    framingGuidance: `- Present both Indian and international perspectives
- Compare Indian standards/policies with global counterparts where relevant
- Reference both Indian institutions (RBI, SEBI, NMC) and international bodies (WHO, IMF, FDA)
- For medical, compare Indian guidelines (ICMR) with international standards (WHO, CDC)
- For industry, reference both BIS/IS standards and ISO/OSHA standards
- Use Indian examples as primary, with international context for comparison
- Note differences between Indian and global approaches when they exist`,
    examplePreference: 'Lead with Indian examples, then add international comparisons. Show how India fits into the global context.',
  },
};

export function resolveAnswerStandard(
  requestedStandard?: string,
  module?: 'study_assistant' | 'current_affairs' | 'medical_learning' | 'industry_learning',
  examType?: string
): StandardContext {
  // If user explicitly selected a standard, use it
  if (requestedStandard && requestedStandard in STANDARD_CONFIGS) {
    return STANDARD_CONFIGS[requestedStandard as AnswerStandard];
  }

  // Default logic based on module and exam type
  const indianExams = ['UPSC', 'SSC', 'Banking', 'RRB', 'State PSC', 'CUET', 'JEE', 'NEET', 'GATE', 'NDA', 'CDS', 'IBPS', 'SBI'];
  const internationalExams = ['USMLE', 'NCLEX', 'IELTS', 'TOEFL', 'GRE', 'SAT'];

  if (module === 'medical_learning') {
    if (examType && internationalExams.some(e => (examType || '').toUpperCase().includes(e))) {
      return STANDARD_CONFIGS.international;
    }
    return STANDARD_CONFIGS.indian;
  }

  if (module === 'industry_learning') {
    return STANDARD_CONFIGS.indian;
  }

  if (module === 'study_assistant') {
    return STANDARD_CONFIGS.indian;
  }

  if (module === 'current_affairs') {
    if (!examType || examType === 'General' || indianExams.some(e => (examType || '').toUpperCase().includes(e))) {
      return STANDARD_CONFIGS.indian;
    }
  }

  return STANDARD_CONFIGS.indian;
}

export function buildStandardPromptSection(context: StandardContext): string {
  return `
ANSWER STANDARD: ${context.standard.toUpperCase()}
LANGUAGE: ${context.languageStyle}
FRAMING:
${context.framingGuidance}
EXAMPLES: ${context.examplePreference}`;
}
