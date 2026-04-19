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
// Commerce & CA Learning Modes & Specializations
// ──────────────────────────────────────────────────────────────

export type CommerceMode =
  | 'concept_explain'
  | 'solve_problems'
  | 'case_study'
  | 'exam_prep'
  | 'standards_learning'
  | 'tax_computation'
  | 'audit_learning'
  | 'quiz_mode';

export type CommerceUserLevel =
  | 'class_11_12'
  | 'bcom'
  | 'bba'
  | 'ca_foundation'
  | 'ca_inter'
  | 'ca_final'
  | 'cs_student'
  | 'cma_student'
  | 'mcom'
  | 'mba_finance';

export type CommerceSpecialization =
  | 'accountancy'
  | 'cost_accounting'
  | 'taxation'
  | 'auditing'
  | 'corporate_law'
  | 'economics'
  | 'financial_management'
  | 'business_studies'
  | 'statistics'
  | 'general';

const COMMERCE_MODE_INSTRUCTIONS: Record<CommerceMode, string> = {
  concept_explain: `Explain the commerce/accounting concept thoroughly. Structure as:
1. **Definition** — Clear, textbook-quality definition
2. **Concept Explanation** — Detailed explanation with context
3. **Key Principles** — Underlying accounting/business principles
4. **Accounting Treatment** — How it's recorded in books (journal entries, ledger if applicable)
5. **Format / Presentation** — Relevant financial statement format
6. **Illustration** — Numerical example with working
7. **Indian Context** — Indian Companies Act / Ind AS / Income Tax Act reference
8. **Common Mistakes** — What students frequently get wrong
9. **Exam Tips** — Key points for CA/CS/university exams
10. **Related Topics** — Connected concepts to study together`,

  solve_problems: `Solve the accounting/commerce problem step by step. Structure as:
1. **Given Information** — List all data provided
2. **Requirement** — What needs to be calculated/prepared
3. **Applicable Standard / Rule** — Which accounting standard or rule applies
4. **Working Notes** — Show all calculations in working notes
5. **Solution** — Prepare the required format (journal, ledger, trial balance, final accounts, etc.)
6. **Verification** — Cross-check the answer (totals tally, etc.)
7. **Adjustment Notes** — Explain any adjustments made
8. **Alternative Method** — If applicable, show another approach
9. **Common Errors** — Where students typically make mistakes

Use proper accounting formats with ₹ symbol. Align Dr/Cr columns properly.`,

  case_study: `Present a business/commerce case study for analysis:
1. **Case Scenario** — Business situation description (fictional, educational)
2. **Background** — Company/industry context
3. **Financial Data** — Relevant numbers and statements
4. **Issues / Questions** — Key problems to analyze
5. **Analysis Framework** — Applicable theories and tools (SWOT, ratio analysis, etc.)
6. **Solution Approach** — Step-by-step analysis
7. **Recommendations** — Practical suggestions with justification
8. **Key Takeaways** — Learning points from the case
9. **Discussion Questions** — Further questions for practice

DISCLAIMER: This is a fictional educational case study.`,

  exam_prep: `Structure content for CA / CS / CMA / university exam preparation:
1. **Topic Summary** — Core concepts in exam-ready format
2. **Key Definitions** — Must-know definitions (as per ICAI/ICSI study material)
3. **Important Sections** — Relevant sections of Companies Act / Income Tax Act
4. **High-Yield Points** — Frequently tested concepts
5. **Numerical Practice** — Exam-pattern problems with solutions
6. **Theory Questions** — Important theory questions with model answers
7. **Amendments / Updates** — Latest amendments in the topic area
8. **Common Traps** — Where students lose marks
9. **Mnemonics** — Memory aids for sections, rates, provisions
10. **Quick Revision** — One-liner recap points`,

  standards_learning: `Explain the Accounting Standard / Ind AS / IFRS:
1. **Standard Name & Number** — Full title (e.g., Ind AS 16, AS 10)
2. **Objective** — Purpose of the standard
3. **Scope** — What it covers and exclusions
4. **Key Definitions** — Important terms defined in the standard
5. **Recognition Criteria** — When to recognise in financial statements
6. **Measurement** — Initial and subsequent measurement rules
7. **Disclosure Requirements** — What to disclose in notes
8. **Practical Example** — Numerical illustration
9. **Ind AS vs AS Comparison** — Key differences (Indian context)
10. **IFRS Comparison** — Differences with global standards
11. **Exam Questions** — Probable exam questions on this standard`,

  tax_computation: `Guide through tax computation step by step:
1. **Assessment Year / Previous Year** — Identify applicable period
2. **Applicable Law** — Income Tax Act sections / GST provisions
3. **Head of Income** — Under which head (Salary, HP, PGBP, CG, IFOS)
4. **Gross Income** — Calculate gross income under respective head
5. **Deductions / Exemptions** — Applicable deductions (Chapter VI-A, etc.)
6. **Taxable Income** — Compute total taxable income
7. **Tax Computation** — Calculate tax as per applicable slab/rate
8. **Surcharge & Cess** — Add surcharge and cess
9. **TDS / Advance Tax** — Account for taxes already paid
10. **Net Tax Payable** — Final tax liability

IMPORTANT: Tax rates and provisions are for EDUCATIONAL purposes as per latest Finance Act. Always verify with current law for actual filing.`,

  audit_learning: `Explain the audit concept / procedure:
1. **Audit Topic** — Name and context
2. **Objective** — Purpose of this audit procedure
3. **Applicable Standards** — SA (Standards on Auditing) reference
4. **Legal Framework** — Companies Act / relevant statute provisions
5. **Audit Procedure** — Step-by-step audit steps
6. **Verification Points** — What to check and how
7. **Documentation** — Working paper requirements
8. **Reporting** — How to report findings
9. **Common Issues** — Typical audit findings
10. **Case Examples** — Educational scenarios illustrating the concept`,

  quiz_mode: `Generate commerce/accounting quiz questions:
- Mix of MCQ, practical problems, and theory questions
- Include CA/CS exam-pattern questions
- Cover accounting, law, tax, and audit topics
- Include "Why other options are wrong" for MCQs
- Show detailed working for practical problems

Format:
### Q1. [Question]
(a) [Option A]  (b) [Option B]  (c) [Option C]  (d) [Option D]
**Answer:** [Correct option]
**Explanation:** [Detailed explanation with section/standard reference]`,
};

const LEVEL_CONTEXT: Record<CommerceUserLevel, string> = {
  class_11_12: '11th-12th Commerce Student — Accountancy, Business Studies, Economics, Informatics Practices. CBSE/ISC/State Board patterns. Focus on journal entries, final accounts, partnership, company accounts, macro/micro economics, business organisation.',
  bcom: 'B.Com Student — Financial Accounting, Cost Accounting, Business Law, Corporate Accounting, Income Tax, Auditing. University exam focus. Include practical problems with journal entries and financial statements.',
  bba: 'BBA Student — Business management with accounting basics, financial management, marketing, HR, business analytics. Applied business orientation.',
  ca_foundation: 'CA Foundation Student — ICAI CA Foundation syllabus (Principles of Accounting, Business Law, Quantitative Aptitude, Business Economics). Foundation-level depth.',
  ca_inter: 'CA Intermediate Student — ICAI CA Inter syllabus (Advanced Accounting, Auditing, Corporate Law, Cost Accounting, Taxation, FM-Eco). Exam-oriented depth with RTP and past paper focus.',
  ca_final: 'CA Final Student — ICAI CA Final syllabus (Financial Reporting, Strategic FM, Advanced Auditing, Corporate Law, Direct/Indirect Tax). Expert-level depth with case studies and standards analysis.',
  cs_student: 'Company Secretary Student — ICSI syllabus (Company Law, Securities Law, Corporate Governance, Drafting, Tax Laws). Focus on legal compliance, secretarial practice, corporate governance.',
  cma_student: 'CMA Student — ICMAI syllabus (Cost Accounting, Management Accounting, Financial Management, Strategic Management, Tax Laws). Focus on costing, budgeting, performance management.',
  mcom: 'M.Com Student — Advanced Accounting, Research Methodology, International Finance, Advanced Auditing. Analytical depth with research orientation.',
  mba_finance: 'MBA Finance Student — Corporate Finance, Investment Analysis, Risk Management, Financial Derivatives, International Finance. Case-study approach with industry application.',
};

const SPECIALIZATION_CONTEXT: Record<CommerceSpecialization, string> = {
  accountancy: 'Financial Accounting — journal entries, ledger, trial balance, final accounts (Trading, P&L, Balance Sheet), company accounts, partnership accounts. Ind AS and AS references.',
  cost_accounting: 'Cost Accounting — material costing, labour costing, overhead absorption, process costing, job costing, standard costing, marginal costing, budgetary control. CAS (Cost Accounting Standards) references.',
  taxation: 'Taxation — Income Tax (assessment, deductions, capital gains, TDS, advance tax), GST (supply, input credit, returns, place of supply). Latest Finance Act provisions.',
  auditing: 'Auditing & Assurance — audit planning, internal control, vouching, verification, company audit, tax audit, special audits. Standards on Auditing (SA) references.',
  corporate_law: 'Corporate & Business Law — Indian Companies Act 2013, LLP Act, Contract Act, Sale of Goods Act, Partnership Act, Negotiable Instruments Act, SEBI regulations.',
  economics: 'Business Economics — micro economics (demand-supply, elasticity, market structures), macro economics (national income, money & banking, fiscal policy, trade), Indian economy.',
  financial_management: 'Financial Management — capital budgeting (NPV, IRR), cost of capital, capital structure, working capital management, dividend theories, portfolio theory, CAPM.',
  business_studies: 'Business Studies — business environment, principles of management, business organisation, marketing management, financial markets, entrepreneurship, corporate governance.',
  statistics: 'Business Statistics & Mathematics — probability, correlation & regression, index numbers, time series, statistical quality control, linear programming, business mathematics.',
  general: 'General Commerce — cross-disciplinary topics, current developments in commerce, industry-academia interface, professional skills development.',
};

class CommerceLearningService {
  private async callOpenRouter(
    messages: ChatMessage[],
    model?: string,
    options?: { maxTokens?: number; temperature?: number }
  ): Promise<string> {
    const selectedModel = model || env.OPENROUTER_MODEL;
    const maxTokens = options?.maxTokens || 4096;
    const temperature = options?.temperature ?? 0.4;

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
      logger.error('OpenRouter API error (CommerceLearning)', { status: response.status, error: errorText });

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

  async generateCommerceContent(userId: string, params: {
    topic: string;
    mode?: string;
    userLevel?: string;
    specialization?: string;
    standard?: string;
    difficulty?: string;
    examType?: string;
  }): Promise<FormattedResponse> {
    const { topic, mode, userLevel, specialization, standard, difficulty, examType } = params;

    if (!topic || !topic.trim()) {
      throw new BadRequestError('Topic is required for commerce learning.');
    }

    const ctx = resolveUserIntent({
      userType: 'student',
      domain: 'finance',
      standard: standard || 'indian',
      outputMode: mode === 'quiz_mode' ? 'quiz' : mode === 'case_study' ? 'case_study' : mode === 'exam_prep' ? 'exam_answer' : 'learn',
      difficulty,
      module: 'commerce_learning',
      examType,
    });

    const comMode: CommerceMode = isValidCommerceMode(mode) ? mode : 'concept_explain';
    const comLevel: CommerceUserLevel = isValidCommerceLevel(userLevel) ? userLevel : 'bcom';
    const comSpec: CommerceSpecialization = isValidSpecialization(specialization) ? specialization : 'general';

    const standardCtx = resolveAnswerStandard(
      standard as AnswerStandard || undefined,
      'study_assistant',
      examType
    );

    const systemPrompt = this.buildCommerceSystemPrompt(comMode, comLevel, comSpec, ctx, standardCtx);

    let userPrompt = `Topic: ${topic}`;
    if (specialization) userPrompt += `\nSpecialization: ${specialization}`;
    if (examType) userPrompt += `\nExam Context: ${examType}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const content = await this.callOpenRouter(messages, undefined, {
      maxTokens: 4096,
      temperature: comMode === 'quiz_mode' ? 0.6 : 0.4,
    });

    return formatResponse(content, ctx, 'commerce_learning', {
      topic,
      mode: comMode,
      userLevel: comLevel,
      specialization: comSpec,
      examType: examType || null,
    });
  }

  private buildCommerceSystemPrompt(
    mode: CommerceMode,
    level: CommerceUserLevel,
    specialization: CommerceSpecialization,
    ctx: BoundaryContext,
    standardCtx: StandardContext
  ): string {
    const modeInstruction = COMMERCE_MODE_INSTRUCTIONS[mode];
    const levelContext = LEVEL_CONTEXT[level];
    const specContext = SPECIALIZATION_CONTEXT[specialization];

    const standardSection = ctx.standard === 'indian'
      ? `
INDIAN COMMERCE STANDARD:
- Reference Indian textbooks (TS Grewal, DK Goel, Tulsian, ICAI study material)
- Companies Act 2013, Income Tax Act 1961, GST Act 2017
- Ind AS (Indian Accounting Standards) and AS (Accounting Standards)
- ICAI / ICSI / ICMAI study materials and RTPs
- RBI, SEBI, IRDAI regulatory frameworks
- Indian Companies Act formats for financial statements
- CA / CS / CMA exam patterns
- CBSE / ISC / State Board patterns for 11th-12th
- Use ₹ for all currency amounts`
      : ctx.standard === 'international'
      ? `
INTERNATIONAL COMMERCE STANDARD:
- Reference global standards (IFRS, US GAAP, IAS)
- ACCA / CPA / CFA exam patterns
- International business law and trade regulations
- Use $ for currency amounts with global context
- Reference global textbooks (Kieso, Anthony, Horngren)`
      : `
HYBRID COMMERCE STANDARD:
- Blend Indian and international accounting standards
- Compare Ind AS vs IFRS where differences exist
- Reference both Indian and international textbooks
- CA + ACCA/CPA exam preparation focus
- Dual currency context (₹ and $)`;

    return `You are SRP Education AI — Commerce & CA Learning Assistant.
You provide EDUCATIONAL commerce, accounting, tax, and business content to students and professionals.
${buildBoundaryContextPrompt(ctx)}
${buildStandardPromptSection(standardCtx)}

LEARNER PROFILE: ${levelContext}

SPECIALIZATION: ${specContext}
${standardSection}

RESPONSE MODE: ${mode.toUpperCase().replace(/_/g, ' ')}
${modeInstruction}

${buildContentPolicyPrompt('commerce')}

COMMERCE EDUCATION RULES:
1. Tax computations are for EDUCATIONAL purposes only — always verify with current Finance Act before actual filing.
2. Accounting treatments should reference applicable standard (AS / Ind AS / IFRS) explicitly.
3. Legal sections should be cited accurately (e.g., "Section 2(41) of Companies Act 2013").
4. Never provide actual financial/investment advice for real situations.
5. Use proper accounting formats — align Dr/Cr, use ₹ symbol, show narration in journal entries.
6. For CA/CS/CMA prep, reference ICAI/ICSI/ICMAI study material structure.
7. Case studies use FICTIONAL companies and data.
8. GST computations should reference current CGST/SGST/IGST rates (educational).
9. Always mention if laws/rates have been superseded by amendments.
10. Show working notes separately for complex problems.

FORMATTING:
- Use markdown headings (##, ###) for structure
- Use **bold** for key terms, section numbers, and standard references
- Use tables for financial statements, comparisons, and accounting formats
- Use bullet points for provisions and rules
- Number procedural steps and journal entries
- Indent sub-entries properly in financial statements`;
  }
}

function isValidCommerceMode(v?: string): v is CommerceMode {
  const modes: CommerceMode[] = ['concept_explain', 'solve_problems', 'case_study', 'exam_prep', 'standards_learning', 'tax_computation', 'audit_learning', 'quiz_mode'];
  return !!v && modes.includes(v as CommerceMode);
}

function isValidCommerceLevel(v?: string): v is CommerceUserLevel {
  const levels: CommerceUserLevel[] = ['class_11_12', 'bcom', 'bba', 'ca_foundation', 'ca_inter', 'ca_final', 'cs_student', 'cma_student', 'mcom', 'mba_finance'];
  return !!v && levels.includes(v as CommerceUserLevel);
}

function isValidSpecialization(v?: string): v is CommerceSpecialization {
  const specs: CommerceSpecialization[] = ['accountancy', 'cost_accounting', 'taxation', 'auditing', 'corporate_law', 'economics', 'financial_management', 'business_studies', 'statistics', 'general'];
  return !!v && specs.includes(v as CommerceSpecialization);
}

export const commerceLearningService = new CommerceLearningService();
