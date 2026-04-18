export type AnswerStandard = 'indian' | 'international' | 'neutral';

interface StandardContext {
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
};

export function resolveAnswerStandard(
  requestedStandard?: string,
  module?: 'study_assistant' | 'current_affairs',
  examType?: string
): StandardContext {
  // If user explicitly selected a standard, use it
  if (requestedStandard && requestedStandard in STANDARD_CONFIGS) {
    return STANDARD_CONFIGS[requestedStandard as AnswerStandard];
  }

  // Default logic based on module and exam type
  const indianExams = ['UPSC', 'SSC', 'Banking', 'RRB', 'State PSC', 'CUET', 'JEE', 'NEET', 'GATE', 'NDA', 'CDS', 'IBPS', 'SBI'];

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
