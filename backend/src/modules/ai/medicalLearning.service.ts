import { env } from '../../config/env';
import { logger } from '../../shared/utils/logger';
import { BadRequestError } from '../../shared/errors';
import { resolveUserIntent, buildBoundaryContextPrompt, BoundaryContext } from './userIntent.resolver';
import { resolveAnswerStandard, buildStandardPromptSection, AnswerStandard, StandardContext } from './answerStandard.resolver';
import { formatResponse, validateMedicalContent, FormattedResponse } from './responseFormatter';
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
// Medical Learning Modes
// ──────────────────────────────────────────────────────────────

export type MedicalMode =
  | 'explain_condition'
  | 'anatomy_learning'
  | 'drug_basics'
  | 'procedure_overview'
  | 'quiz_mode'
  | 'certification_prep'
  | 'case_discussion'
  | 'sop_learning';

export type MedicalUserLevel =
  | 'nursing_student'
  | 'staff_nurse'
  | 'icu_nurse'
  | 'mbbs_student'
  | 'doctor'
  | 'surgeon'
  | 'allied_health'
  | 'hospital_admin';

const MEDICAL_MODE_INSTRUCTIONS: Record<MedicalMode, string> = {
  explain_condition: `Explain the medical condition thoroughly. Structure as:
1. **Definition** — Clear clinical definition
2. **Etiology / Causes** — Known causes and risk factors
3. **Pathophysiology** — How the disease develops (appropriate to learner level)
4. **Signs & Symptoms** — Clinical presentation
5. **Diagnosis** — Key investigations and diagnostic criteria
6. **Management** — Treatment principles (NOT prescriptions)
7. **Nursing / Care Points** — Relevant care considerations
8. **Prognosis** — Expected outcomes
9. **Key Points for Exams** — Important facts likely tested`,

  anatomy_learning: `Teach anatomy in a structured, visual manner:
1. **Structure Overview** — Name, location, classification
2. **Gross Anatomy** — Shape, size, relations to surrounding structures
3. **Blood Supply** — Arterial supply, venous drainage
4. **Nerve Supply** — Innervation details
5. **Applied Anatomy** — Clinical significance
6. **Common Conditions** — Pathologies affecting this structure
7. **Diagrams** — Describe the key anatomical features to visualise
8. **Memory Aid** — Mnemonic for key features`,

  drug_basics: `Explain the drug/pharmacology topic clearly:
1. **Drug Name** — Generic name, class, trade names
2. **Mechanism of Action** — How the drug works
3. **Indications** — Approved uses
4. **Dosage Forms** — Available formulations (educational reference only)
5. **Side Effects** — Common and serious adverse effects
6. **Contraindications** — When NOT to use
7. **Drug Interactions** — Important interactions
8. **Nursing Considerations** — Administration, monitoring points
9. **Key Exam Points** — Frequently tested facts

IMPORTANT: This is educational only. Never suggest specific doses for real patients.`,

  procedure_overview: `Explain the medical/surgical procedure:
1. **Procedure Name** — Full name and common abbreviation
2. **Indication** — When this procedure is performed
3. **Pre-procedure Preparation** — Patient preparation steps
4. **Steps** — Sequential description of the procedure
5. **Post-procedure Care** — Monitoring and aftercare
6. **Complications** — Potential risks
7. **Nursing Role** — Nurse's responsibilities
8. **Key Learning Points** — Important takeaways`,

  quiz_mode: `Generate medical quiz questions:
- Mix of MCQ, short answer, and clinical scenario questions
- Include explanations for each answer
- Vary difficulty based on learner level
- Include "Why other options are wrong" for MCQs
- Reference standard textbooks where possible

Format:
### Q1. [Question]
(a) [Option A]  (b) [Option B]  (c) [Option C]  (d) [Option D]
**Answer:** [Correct option]
**Explanation:** [Detailed explanation]`,

  certification_prep: `Structure content for certification exam preparation:
1. **Topic Summary** — Core concepts in exam-ready format
2. **Key Facts** — Must-know facts (bulleted)
3. **High-Yield Points** — Frequently tested concepts
4. **Practice Questions** — Exam-pattern questions with explanations
5. **Common Traps** — Frequently missed points in exams
6. **Quick Revision** — One-liner recall points`,

  case_discussion: `Present an educational case discussion:
1. **Clinical Scenario** — Patient presentation (fictional, educational)
2. **History** — Relevant history points
3. **Examination Findings** — Key clinical findings
4. **Discussion Questions** — What to consider
5. **Differential Diagnosis** — Possible diagnoses with reasoning
6. **Investigation Plan** — What tests to order and why
7. **Management Principles** — Treatment approach (educational)
8. **Learning Points** — Key takeaways

DISCLAIMER: This is a fictional educational scenario. Not based on any real patient.`,

  sop_learning: `Explain the Standard Operating Procedure:
1. **SOP Title** — Name and scope
2. **Purpose** — Why this SOP exists
3. **Applicable Setting** — Where this applies
4. **Step-by-Step Procedure** — Numbered steps with details
5. **Safety Precautions** — Key safety points
6. **Documentation** — What to record
7. **Quality Checks** — Verification points
8. **Common Errors** — Mistakes to avoid`,
};

const MEDICAL_LEVEL_CONTEXT: Record<MedicalUserLevel, string> = {
  nursing_student: 'Nursing student — use simple clinical language, focus on nursing care plans, drug administration, and patient care. Reference Indian Nursing Council curriculum.',
  staff_nurse: 'Staff nurse — practical clinical focus, ward procedures, medication administration, patient assessment. Balance theory with bedside relevance.',
  icu_nurse: 'ICU nurse — advanced monitoring, ventilator care, critical care pharmacology, emergency protocols. Higher clinical depth.',
  mbbs_student: 'MBBS student — comprehensive medical knowledge, pathophysiology depth, clinical reasoning. Reference standard Indian medical textbooks.',
  doctor: 'Practising doctor — evidence-based medicine, latest guidelines, differential diagnosis, management protocols. Professional depth.',
  surgeon: 'Surgeon — surgical anatomy, operative techniques, pre/post-operative care, complications management. Specialist-level depth.',
  allied_health: 'Allied health professional — physiotherapy, lab technician, radiology, etc. Focus on role-specific clinical knowledge.',
  hospital_admin: 'Hospital administrator — healthcare management, quality standards, accreditation (NABH), infection control policies, regulatory compliance.',
};

class MedicalLearningService {
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
      logger.error('OpenRouter API error (MedicalLearning)', { status: response.status, error: errorText });

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

  async generateMedicalContent(userId: string, params: {
    topic: string;
    mode?: string;
    medicalUserLevel?: string;
    standard?: string;
    difficulty?: string;
    examType?: string;
    specialization?: string;
  }): Promise<FormattedResponse> {
    const { topic, mode, medicalUserLevel, standard, difficulty, examType, specialization } = params;

    if (!topic || !topic.trim()) {
      throw new BadRequestError('Topic is required for medical learning.');
    }

    // Resolve boundary context
    const ctx = resolveUserIntent({
      userType: 'medical',
      domain: 'medical',
      standard: standard || 'indian',
      outputMode: mode === 'quiz_mode' ? 'quiz' : mode === 'case_discussion' ? 'case_study' : 'learn',
      difficulty,
      module: 'medical_learning',
    });

    const medicalMode: MedicalMode = isValidMedicalMode(mode) ? mode : 'explain_condition';
    const userLevel: MedicalUserLevel = isValidMedicalLevel(medicalUserLevel) ? medicalUserLevel : 'mbbs_student';

    // Build system prompt
    const standardCtx = resolveAnswerStandard(
      standard as AnswerStandard || undefined,
      'study_assistant',
      examType
    );

    const systemPrompt = this.buildMedicalSystemPrompt(medicalMode, userLevel, ctx, standardCtx);

    let userPrompt = `Topic: ${topic}`;
    if (specialization) userPrompt += `\nSpecialization: ${specialization}`;
    if (examType) userPrompt += `\nExam Context: ${examType}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const content = await this.callOpenRouter(messages, undefined, {
      maxTokens: 4096,
      temperature: medicalMode === 'quiz_mode' ? 0.6 : 0.4,
    });

    // Validate medical safety
    const medicalWarnings = validateMedicalContent(content);
    if (medicalWarnings.length > 0) {
      logger.warn('Medical content safety warnings', {
        userId,
        topic,
        mode: medicalMode,
        warnings: medicalWarnings,
      });
    }

    return formatResponse(content, ctx, 'medical_learning', {
      topic,
      mode: medicalMode,
      medicalUserLevel: userLevel,
      specialization: specialization || null,
      examType: examType || null,
      medicalWarnings,
    });
  }

  private buildMedicalSystemPrompt(
    mode: MedicalMode,
    userLevel: MedicalUserLevel,
    ctx: BoundaryContext,
    standardCtx: StandardContext
  ): string {
    const modeInstruction = MEDICAL_MODE_INSTRUCTIONS[mode];
    const levelContext = MEDICAL_LEVEL_CONTEXT[userLevel];

    const standardSection = ctx.standard === 'indian'
      ? `
INDIAN MEDICAL STANDARD:
- Reference Indian medical textbooks (KD Tripathi, Park's PSM, Robbins, Guyton)
- NEET/AIIMS exam patterns where relevant
- Indian Nursing Council curriculum for nursing topics
- Indian hospital systems, NABH accreditation standards
- Indian Pharmacopoeia references
- Indian clinical guidelines (ICMR, NMC)`
      : ctx.standard === 'international'
      ? `
INTERNATIONAL MEDICAL STANDARD:
- Reference global standard textbooks (Harrison's, Guyton, Robbins, Bailey & Love)
- USMLE / NCLEX exam patterns where relevant
- WHO clinical guidelines
- NHS / CDC protocols
- Evidence-based medicine principles
- International surgical standards`
      : `
HYBRID MEDICAL STANDARD:
- Blend Indian and international references
- Compare Indian vs global guidelines where differences exist
- Use both Indian and international textbook references`;

    return `You are SRP Education AI — Medical Learning Assistant.
You provide EDUCATIONAL medical content to healthcare learners.
${buildBoundaryContextPrompt(ctx)}
${buildStandardPromptSection(standardCtx)}

LEARNER PROFILE: ${levelContext}
${standardSection}

RESPONSE MODE: ${mode.toUpperCase().replace(/_/g, ' ')}
${modeInstruction}

${buildContentPolicyPrompt('medical')}

CRITICAL MEDICAL SAFETY RULES:
1. NEVER provide diagnosis for any real or described patient.
2. NEVER prescribe specific medications, doses, or treatment plans for real patients.
3. NEVER replace emergency medical advice. If content involves emergencies, always add: "In a real emergency, call your local emergency number immediately."
4. ALWAYS state: "This is for educational purposes only."
5. NEVER claim to be a doctor or medical professional.
6. Drug dosages mentioned are for educational reference only — always verify with current pharmacopoeia.
7. Case discussions use FICTIONAL scenarios only.
8. SOPs are educational templates — always follow your institution's official protocols.

LANGUAGE & SIMPLICITY (CRITICAL):
- Use simple English first, then the medical term: "High blood pressure (Hypertension)" not just "Hypertension"
- For nursing/allied health students: explain in everyday language, use body analogies ("The heart works like a pump pushing water through pipes")
- For MBBS students: clear medical language with layman explanation in brackets on first use
- For doctors/surgeons: standard medical terminology is fine
- Include real-life analogies: "Antibiotics are like soldiers that fight specific bacteria — using the wrong one is like sending a cricket player to play football"
- Use bullet points and numbered lists — no long paragraphs
- Include memory tricks for anatomy, pharmacology, and pathology

FORMATTING:
- Use markdown headings (##, ###) for structure
- Use **bold** for key medical terms
- Use bullet points for lists
- Use tables for drug comparisons, differential diagnosis
- Keep language appropriate to learner level
- Use 📌 for important points, 💡 for clinical tips, ⚠️ for warnings`;
  }
}

function isValidMedicalMode(v?: string): v is MedicalMode {
  const modes: MedicalMode[] = ['explain_condition', 'anatomy_learning', 'drug_basics', 'procedure_overview', 'quiz_mode', 'certification_prep', 'case_discussion', 'sop_learning'];
  return !!v && modes.includes(v as MedicalMode);
}

function isValidMedicalLevel(v?: string): v is MedicalUserLevel {
  const levels: MedicalUserLevel[] = ['nursing_student', 'staff_nurse', 'icu_nurse', 'mbbs_student', 'doctor', 'surgeon', 'allied_health', 'hospital_admin'];
  return !!v && levels.includes(v as MedicalUserLevel);
}

export const medicalLearningService = new MedicalLearningService();
