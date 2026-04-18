export interface ExamContext {
  examType: string;
  examLabel: string;
  paperRelevance: string;
  framingNotes: string;
  syllabusRefs: string[];
}

const EXAM_CONFIGS: Record<string, ExamContext> = {
  UPSC: {
    examType: 'UPSC',
    examLabel: 'UPSC Civil Services',
    paperRelevance: 'Mention GS Paper relevance (GS-I: History/Culture/Geography, GS-II: Polity/Governance/IR, GS-III: Economy/S&T/Environment, GS-IV: Ethics). Also mention Essay and Optional relevance where applicable.',
    framingNotes: 'Provide multi-dimensional analysis (political, economic, social, environmental angles). Include Mains-type analytical questions. Mention previous year question patterns.',
    syllabusRefs: ['Laxmikanth (Polity)', 'Spectrum (History)', 'Shankar IAS (Environment)', 'Ramesh Singh (Economy)', 'NCERT Class 6-12'],
  },
  SSC: {
    examType: 'SSC',
    examLabel: 'SSC CGL/CHSL',
    paperRelevance: 'Focus on General Awareness section. Cover static GK and current affairs relevant to SSC pattern.',
    framingNotes: 'Keep answers factual, concise, and MCQ-oriented. Focus on dates, names, places, and key facts. Include one-liner format for quick revision.',
    syllabusRefs: ['Lucent GK', 'NCERT Class 6-10'],
  },
  Banking: {
    examType: 'Banking',
    examLabel: 'Banking (IBPS/SBI)',
    paperRelevance: 'Focus on Banking Awareness and General Awareness sections. Cover RBI policies, banking reforms, financial institutions, economic indicators.',
    framingNotes: 'Include banking-specific terminology. Cover current monetary policy, financial inclusion schemes, digital banking initiatives.',
    syllabusRefs: ['RBI publications', 'Economic Survey', 'Banking Awareness guides'],
  },
  RRB: {
    examType: 'RRB',
    examLabel: 'Railway RRB',
    paperRelevance: 'Focus on General Awareness and General Science. Cover Indian Railways facts, government schemes, basic science.',
    framingNotes: 'Keep content simple and factual. Focus on MCQ-friendly format. Include Indian Railways-specific current affairs.',
    syllabusRefs: ['NCERT Class 6-10', 'Lucent GK', 'Railway GK guides'],
  },
  'State PSC': {
    examType: 'State PSC',
    examLabel: 'State PSC',
    paperRelevance: 'Cover General Studies with state-specific relevance. Include national and state-level current affairs.',
    framingNotes: 'Balance national and state perspectives. Include district-level governance and state-specific schemes where relevant.',
    syllabusRefs: ['State-specific GK books', 'NCERT', 'State government publications'],
  },
  CUET: {
    examType: 'CUET',
    examLabel: 'CUET',
    paperRelevance: 'Focus on General Knowledge section. Cover current affairs and static GK relevant to university entrance.',
    framingNotes: 'Match CUET exam pattern. Keep content at Class 12 difficulty level. Include MCQ practice.',
    syllabusRefs: ['NCERT Class 11-12', 'CUET preparation guides'],
  },
};

const DEFAULT_EXAM_CONTEXT: ExamContext = {
  examType: 'General',
  examLabel: 'General Competitive Exams',
  paperRelevance: 'Cover broad General Knowledge topics suitable for multiple competitive examinations.',
  framingNotes: 'Keep content well-structured and exam-oriented. Include factual details with dates, names, and significance.',
  syllabusRefs: ['NCERT', 'Standard GK references'],
};

export function resolveExamContext(examType?: string): ExamContext {
  if (!examType || examType === 'General' || examType === '') {
    return DEFAULT_EXAM_CONTEXT;
  }

  const normalised = examType.trim();
  
  // Direct match
  if (normalised in EXAM_CONFIGS) {
    return EXAM_CONFIGS[normalised];
  }

  // Partial match
  const upperExam = normalised.toUpperCase();
  for (const [key, config] of Object.entries(EXAM_CONFIGS)) {
    if (upperExam.includes(key.toUpperCase())) {
      return config;
    }
  }

  return DEFAULT_EXAM_CONTEXT;
}

export function buildExamContextPromptSection(ctx: ExamContext): string {
  return `
TARGET EXAM: ${ctx.examLabel}
PAPER RELEVANCE: ${ctx.paperRelevance}
FRAMING: ${ctx.framingNotes}
REFERENCE BOOKS: ${ctx.syllabusRefs.join(', ')}`;
}
