import { env } from '../../config/env';
import { logger } from '../../shared/utils/logger';
import { BadRequestError } from '../../shared/errors';
import { resolveUserIntent, buildBoundaryContextPrompt, BoundaryContext } from './userIntent.resolver';
import { resolveAnswerStandard, buildStandardPromptSection, AnswerStandard, StandardContext } from './answerStandard.resolver';
import { formatResponse, FormattedResponse } from './responseFormatter';
import { buildContentPolicyPrompt } from './citationManager';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{ message: { role: string; content: string }; finish_reason: string }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

// ──────────────────────────────────────────────────────────────
// Industry Learning Modes & Sectors
// ──────────────────────────────────────────────────────────────

export type IndustryMode =
  | 'sop_explanation'
  | 'safety_learning'
  | 'technical_basics'
  | 'compliance_summary'
  | 'process_training'
  | 'quick_quiz';

export type IndustrySector =
  | 'metal'
  | 'engineering'
  | 'it_software'
  | 'finance'
  | 'hr'
  | 'manufacturing'
  | 'safety'
  | 'corporate'
  | 'general';

const INDUSTRY_MODE_INSTRUCTIONS: Record<IndustryMode, string> = {
  sop_explanation: `Explain the Standard Operating Procedure clearly:
1. **SOP Title** — Name, reference number context
2. **Purpose & Scope** — Why this SOP exists and where it applies
3. **Responsibilities** — Who is responsible for what
4. **Prerequisites** — Required materials, qualifications, PPE
5. **Step-by-Step Procedure** — Numbered steps with clear instructions
6. **Safety Precautions** — Critical safety points at each step
7. **Quality Checks** — Verification and inspection points
8. **Documentation** — What records to maintain
9. **Common Deviations** — What can go wrong and corrective actions
10. **References** — Applicable standards (IS, ISO, OSHA)`,

  safety_learning: `Teach safety concepts for industrial environments:
1. **Safety Topic** — Clear title and context
2. **Hazard Identification** — Types of hazards involved
3. **Risk Assessment** — Severity and likelihood
4. **Control Measures** — Hierarchy of controls (elimination, substitution, engineering, administrative, PPE)
5. **Emergency Procedures** — What to do in case of incident
6. **Legal Requirements** — Applicable Indian/international regulations
7. **Case Examples** — Educational examples of incidents (anonymised)
8. **Safety Quiz** — 3-5 questions to test understanding

Reference Indian standards: Factories Act, DGMS, BIS, OISD where relevant.`,

  technical_basics: `Explain technical concepts for industry learners:
1. **Concept Definition** — Clear definition with industry context
2. **Principles** — Underlying science/engineering principles
3. **Applications** — How this is used in industry
4. **Equipment / Tools** — Related equipment or software
5. **Standards** — Relevant industry standards
6. **Best Practices** — Industry-accepted methods
7. **Common Issues** — Typical problems and troubleshooting
8. **Key Takeaways** — Summary points for quick reference`,

  compliance_summary: `Summarise compliance requirements:
1. **Regulation / Standard** — Full name and reference
2. **Applicability** — Who must comply
3. **Key Requirements** — Main compliance obligations
4. **Documentation** — Required records and reports
5. **Timelines** — Compliance deadlines and review schedules
6. **Penalties** — Consequences of non-compliance
7. **Implementation Steps** — How to achieve compliance
8. **Audit Preparation** — What auditors look for`,

  process_training: `Provide process training content:
1. **Process Name** — Clear identification
2. **Process Overview** — High-level description and flow
3. **Inputs** — Materials, data, resources needed
4. **Process Steps** — Detailed step-by-step with timing
5. **Control Parameters** — Critical parameters to monitor
6. **Quality Criteria** — Acceptance/rejection standards
7. **Outputs** — Expected results and deliverables
8. **Troubleshooting** — Common issues and solutions
9. **Process Map** — Describe the flow visually (indented hierarchy)`,

  quick_quiz: `Generate industry-relevant quiz questions:
- Mix of MCQ, true/false, and scenario-based questions
- Cover safety, technical, and compliance topics
- Include explanations for correct answers
- Reference applicable standards

Format:
### Q1. [Question]
(a) [Option A]  (b) [Option B]  (c) [Option C]  (d) [Option D]
**Answer:** [Correct option]
**Explanation:** [Brief explanation with standard reference]`,
};

const SECTOR_CONTEXT: Record<IndustrySector, string> = {
  metal: 'Metal industry — steel, aluminium, foundry operations, smelting, heat treatment, metallurgical processes. Reference IS standards, DGMS regulations.',
  engineering: 'Engineering sector — mechanical, civil, electrical engineering applications, design principles, materials science, manufacturing processes.',
  it_software: 'IT & Software — software development, DevOps, cloud computing, cybersecurity, project management, Agile/Scrum methodologies.',
  finance: 'Finance sector — banking operations, financial regulations (RBI, SEBI), accounting standards (Ind AS), risk management, compliance.',
  hr: 'Human Resources — labour laws (Indian), recruitment, performance management, employee relations, training & development, statutory compliance.',
  manufacturing: 'Manufacturing sector — lean manufacturing, Six Sigma, quality management (ISO 9001), production planning, supply chain.',
  safety: 'Occupational Safety — industrial safety, fire safety, chemical safety, electrical safety. Reference Factories Act 1948, DGMS, BIS, OISD, OSHA.',
  corporate: 'Corporate training — leadership development, communication skills, onboarding, business writing, presentation skills, team management.',
  general: 'General industry learning — cross-functional topics, professional development, skill-building, industry awareness.',
};

class IndustryLearningService {
  private async callOpenRouter(
    messages: ChatMessage[],
    model?: string,
    options?: { maxTokens?: number; temperature?: number }
  ): Promise<string> {
    const selectedModel = model || env.OPENROUTER_MODEL;
    const maxTokens = options?.maxTokens || 4096;
    const temperature = options?.temperature ?? 0.5;

    const response = await fetch(`${env.OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': env.APP_URL,
        'X-Title': env.APP_NAME,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('OpenRouter API error (IndustryLearning)', { status: response.status, error: errorText });

      if (selectedModel !== env.OPENROUTER_FALLBACK_MODEL) {
        logger.info('Retrying with fallback model', { model: env.OPENROUTER_FALLBACK_MODEL });
        return this.callOpenRouter(messages, env.OPENROUTER_FALLBACK_MODEL, options);
      }

      throw new BadRequestError('AI service is temporarily unavailable. Please try again.');
    }

    const data = (await response.json()) as OpenRouterResponse;
    if (!data.choices?.[0]?.message?.content) {
      throw new BadRequestError('AI returned an empty response. Please try again.');
    }
    return data.choices[0].message.content;
  }

  async generateIndustryContent(userId: string, params: {
    topic: string;
    mode?: string;
    sector?: string;
    standard?: string;
    difficulty?: string;
    role?: string;
  }): Promise<FormattedResponse> {
    const { topic, mode, sector, standard, difficulty, role } = params;

    if (!topic || !topic.trim()) {
      throw new BadRequestError('Topic is required for industry learning.');
    }

    const ctx = resolveUserIntent({
      userType: 'industry',
      domain: sector === 'it_software' ? 'it' : sector === 'finance' ? 'finance' : 'engineering',
      standard: standard || 'indian',
      outputMode: mode === 'quick_quiz' ? 'quiz' : 'learn',
      difficulty,
      module: 'industry_learning',
    });

    const industryMode: IndustryMode = isValidIndustryMode(mode) ? mode : 'technical_basics';
    const industrySector: IndustrySector = isValidSector(sector) ? sector : 'general';

    const standardCtx = resolveAnswerStandard(
      standard as AnswerStandard || undefined,
      'study_assistant'
    );

    const systemPrompt = this.buildIndustrySystemPrompt(industryMode, industrySector, ctx, standardCtx, role);

    let userPrompt = `Topic: ${topic}`;
    if (role) userPrompt += `\nLearner Role: ${role}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const content = await this.callOpenRouter(messages, undefined, {
      maxTokens: 4096,
      temperature: industryMode === 'quick_quiz' ? 0.6 : 0.5,
    });

    return formatResponse(content, ctx, 'industry_learning', {
      topic,
      mode: industryMode,
      sector: industrySector,
      role: role || null,
    });
  }

  private buildIndustrySystemPrompt(
    mode: IndustryMode,
    sector: IndustrySector,
    ctx: BoundaryContext,
    standardCtx: StandardContext,
    role?: string
  ): string {
    const modeInstruction = INDUSTRY_MODE_INSTRUCTIONS[mode];
    const sectorContext = SECTOR_CONTEXT[sector];

    return `You are SRP Education AI — Industry Learning Assistant.
You provide EDUCATIONAL industry and professional training content.
${buildBoundaryContextPrompt(ctx)}
${buildStandardPromptSection(standardCtx)}

SECTOR: ${sectorContext}
${role ? `LEARNER ROLE: ${role}` : ''}

RESPONSE MODE: ${mode.toUpperCase().replace(/_/g, ' ')}
${modeInstruction}

${buildContentPolicyPrompt('industry')}

INDUSTRY SAFETY RULES:
1. Safety-critical procedures are EDUCATIONAL templates only.
2. Always include: "Follow your organisation's official SOPs and safety protocols."
3. Never claim compliance certification on behalf of any organisation.
4. Reference applicable Indian/international standards but do not guarantee regulatory compliance.
5. Real-world implementation must be verified by qualified professionals.

FORMATTING:
- Use markdown headings (##, ###) for structure
- Use **bold** for key terms and standards
- Use bullet points for checklists and steps
- Use tables for comparisons and parameter lists
- Number procedural steps clearly
- Include standard references (IS, ISO, OSHA, etc.) where applicable`;
  }
}

function isValidIndustryMode(v?: string): v is IndustryMode {
  const modes: IndustryMode[] = ['sop_explanation', 'safety_learning', 'technical_basics', 'compliance_summary', 'process_training', 'quick_quiz'];
  return !!v && modes.includes(v as IndustryMode);
}

function isValidSector(v?: string): v is IndustrySector {
  const sectors: IndustrySector[] = ['metal', 'engineering', 'it_software', 'finance', 'hr', 'manufacturing', 'safety', 'corporate', 'general'];
  return !!v && sectors.includes(v as IndustrySector);
}

export const industryLearningService = new IndustryLearningService();
