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
// Engineering Learning Modes & Branches
// ──────────────────────────────────────────────────────────────

export type EngineeringMode =
  | 'concept_explain'
  | 'solve_numericals'
  | 'lab_viva_prep'
  | 'design_problems'
  | 'formula_revision'
  | 'quiz_mode'
  | 'gate_prep'
  | 'project_guidance'
  | 'coding_practice';

export type EngineeringBranch =
  | 'cse'
  | 'ece'
  | 'eee'
  | 'mechanical'
  | 'civil'
  | 'it'
  | 'chemical'
  | 'marine'
  | 'aerospace'
  | 'automobile'
  | 'biomedical'
  | 'general';

export type EngineeringUserLevel =
  | 'class_10'
  | 'class_11_12'
  | 'diploma'
  | 'btech_1_2'
  | 'btech_3_4'
  | 'mtech'
  | 'gate_aspirant'
  | 'working_engineer';

const ENGINEERING_MODE_INSTRUCTIONS: Record<EngineeringMode, string> = {
  concept_explain: `Explain the engineering concept thoroughly. Structure as:
1. **Definition** — Clear, precise definition
2. **Underlying Principle** — Scientific/mathematical basis
3. **Theory & Derivation** — Step-by-step derivation if applicable (use LaTeX: $...$ inline, $$...$$ display)
4. **Types / Classification** — Categories or variations
5. **Working / Mechanism** — How it works in practice
6. **Applications** — Real-world engineering applications
7. **Advantages & Limitations** — Practical trade-offs
8. **Numerical Example** — Solved example with clear steps
9. **Key Points for Exams** — Important facts for GATE/university exams
10. **Memory Aid** — Mnemonic or shortcut to remember`,

  solve_numericals: `Solve the numerical problem step by step. Structure as:
1. **Given Data** — List all given values with units
2. **To Find** — What needs to be calculated
3. **Relevant Formula(s)** — Write the formula(s) using LaTeX ($...$)
4. **Substitution** — Plug in values step by step
5. **Calculation** — Show each calculation step (DO NOT skip steps)
6. **Final Answer** — Box the final answer with correct units
7. **Verification** — Quick dimensional analysis or sanity check
8. **Similar Practice Problem** — One related problem for practice
9. **Common Mistakes** — What students typically get wrong

ALL math MUST use LaTeX: $F = ma$, $$\\int_0^L \\frac{PL}{AE} dx$$. Never output raw formulas without dollar signs.`,

  lab_viva_prep: `Prepare lab viva questions and answers:
1. **Experiment Title** — Name and objective
2. **Theory Brief** — Core theory behind the experiment (2-3 lines)
3. **Apparatus / Components** — List of required equipment
4. **Procedure Summary** — Key steps (numbered)
5. **Expected Observations** — What the student should observe
6. **Viva Questions & Answers** — 10-15 likely viva questions with concise answers
7. **Common Errors** — Typical mistakes during the experiment
8. **Safety Precautions** — Lab safety points
9. **Related Theory Questions** — 3-5 extension questions from theory`,

  design_problems: `Guide through the engineering design/analysis problem:
1. **Problem Statement** — Restate the design requirement clearly
2. **Design Parameters** — Identify known and unknown variables
3. **Applicable Standards** — IS/ASTM/IEEE standards if relevant
4. **Design Methodology** — Step-by-step design approach
5. **Calculations** — Detailed calculations with LaTeX formulas
6. **Selection / Sizing** — Component selection from standard tables
7. **Factor of Safety** — FOS calculation and justification
8. **Design Drawing Description** — Describe key dimensions and features
9. **Optimization Notes** — How to improve the design
10. **Validation** — How to verify the design works`,

  formula_revision: `Create a comprehensive formula sheet:
1. **Topic / Chapter** — Title and scope
2. **Key Formulas** — List all important formulas using LaTeX ($$...$$)
3. **Variable Definitions** — Define every symbol used
4. **Units** — SI units for each quantity
5. **Conditions / Assumptions** — When each formula applies
6. **Quick Derivation Hints** — How to derive if forgotten
7. **Dimensional Analysis** — Verify dimensions
8. **Common Conversions** — Unit conversion factors
9. **Tricks & Shortcuts** — Calculation shortcuts for exams
10. **Practice — Plug & Solve** — 3 quick problems to practice`,

  quiz_mode: `Generate engineering quiz questions:
- Mix of MCQ, numerical, and conceptual questions
- Include GATE-style questions where appropriate
- Vary difficulty based on learner level
- Include "Why other options are wrong" for MCQs
- Show step-by-step solution for numericals

Format:
### Q1. [Question]
(a) [Option A]  (b) [Option B]  (c) [Option C]  (d) [Option D]
**Answer:** [Correct option]
**Solution:** [Detailed step-by-step solution]
**GATE Year Reference:** [If similar question appeared in GATE]`,

  gate_prep: `Structure content for GATE / competitive exam preparation:
1. **Topic Overview** — Weightage in GATE and key subtopics
2. **Core Concepts** — Essential theory in exam-ready format
3. **Important Formulas** — Must-memorize formulas (LaTeX)
4. **High-Yield Points** — Frequently asked concepts in GATE
5. **Previous Year Questions** — GATE-pattern questions with solutions
6. **Shortcut Methods** — Time-saving calculation tricks
7. **Common Traps** — Where students lose marks
8. **One-Liner Revision** — Quick recall statements
9. **Linked Topics** — Related topics to study together
10. **Expected Questions** — Likely question patterns`,

  project_guidance: `Provide engineering project guidance:
1. **Project Title** — Clear, descriptive title
2. **Objective** — What the project aims to achieve
3. **Background / Literature** — Brief review of existing work
4. **Methodology** — Step-by-step approach
5. **Components / Tools Required** — Hardware, software, materials list
6. **Block Diagram / Architecture** — Describe system architecture
7. **Implementation Steps** — Detailed steps with timeline
8. **Expected Results** — What outcome to expect
9. **Testing Plan** — How to test and validate
10. **References** — Suggested papers and resources

NOTE: This is educational guidance. Actual implementation must be supervised by faculty.`,

  coding_practice: `Provide coding practice content for engineering students:
1. **Problem Statement** — Clear description of the coding problem
2. **Input / Output Format** — Expected I/O with examples
3. **Approach** — Algorithm explanation (pseudocode or steps)
4. **Code Solution** — Clean, commented code (language as appropriate)
5. **Time Complexity** — Big-O analysis
6. **Space Complexity** — Memory usage analysis
7. **Edge Cases** — Important edge cases to handle
8. **Variations** — Modified versions of the problem
9. **Practice Problems** — 2-3 related problems to try

Use proper code blocks with syntax highlighting. Explain WHY each approach works.`,
};

const BRANCH_CONTEXT: Record<EngineeringBranch, string> = {
  cse: 'Computer Science & Engineering — data structures, algorithms, OS, DBMS, computer networks, compiler design, theory of computation, software engineering, AI/ML basics. Reference GATE CS syllabus, standard textbooks (Cormen, Galvin, Tanenbaum, Navathe).',
  ece: 'Electronics & Communication Engineering — analog/digital electronics, signals & systems, communication systems, control systems, VLSI, microprocessors, electromagnetic theory. Reference GATE EC syllabus, textbooks (Sedra & Smith, Haykin, Ogata).',
  eee: 'Electrical & Electronics Engineering — power systems, electrical machines, power electronics, control systems, utilization of electrical energy, switchgear & protection, electrical measurements. Reference GATE EE syllabus, textbooks (Nagrath & Kothari, DP Kothari, Chapman).',
  mechanical: 'Mechanical Engineering — thermodynamics, fluid mechanics, strength of materials, manufacturing, machine design, heat transfer, IC engines, RAC, industrial engineering. Reference GATE ME syllabus, textbooks (PK Nag, RK Rajput, Rattan, Khurmi).',
  civil: 'Civil Engineering — structural analysis, RCC design, soil mechanics, fluid mechanics, surveying, environmental engineering, transportation, water resources. Reference GATE CE syllabus, textbooks (BC Punmia, SS Bhavikatti, Arora & Jha).',
  it: 'Information Technology — web technologies, software development, cloud computing, cybersecurity, database systems, networking. Similar to CSE with more applied focus.',
  chemical: 'Chemical Engineering — mass transfer, heat transfer, fluid mechanics, chemical reaction engineering, process control, thermodynamics, process design. Reference GATE CH syllabus.',
  marine: 'Marine Engineering — marine diesel engines, naval architecture, ship construction, marine auxiliary machinery, marine electrotechnology, maritime safety. Reference IMO standards.',
  aerospace: 'Aerospace Engineering — aerodynamics, structures, propulsion, flight mechanics, space dynamics, aircraft design. Reference GATE AE syllabus.',
  automobile: 'Automobile Engineering — vehicle dynamics, IC engines, transmission systems, chassis design, automotive electronics, emission control. Reference ARAI standards.',
  biomedical: 'Biomedical Engineering — biomechanics, medical imaging, biosensors, biomedical instrumentation, biomaterials, rehabilitation engineering. Reference FDA/CDSCO standards.',
  general: 'General Engineering — cross-disciplinary topics, engineering mathematics, applied physics, workshop practice, engineering drawing, basic concepts.',
};

const LEVEL_CONTEXT: Record<EngineeringUserLevel, string> = {
  class_10: '10th Standard Student — Focus on Maths (algebra, geometry, trigonometry), Science (physics, chemistry basics). Use simple language, real-life examples. CBSE/ICSE/State Board patterns. Build strong fundamentals for MPC stream.',
  class_11_12: '11th-12th MPC Student — Physics (mechanics, waves, optics, modern physics), Chemistry (organic, inorganic, physical), Mathematics (calculus, coordinate geometry, probability). JEE/EAMCET/board exam level. Use formulas, solved examples, exam tips.',
  diploma: 'Polytechnic Diploma Student — Applied engineering focus, practical orientation. DOTE/SBTET syllabus. Balance between theory and hands-on. Include workshop/lab context.',
  btech_1_2: 'B.Tech 1st-2nd Year — Engineering fundamentals, applied maths, basic science, introduction to branch-specific subjects. University exam patterns. Include derivations and numerical problems.',
  btech_3_4: 'B.Tech 3rd-4th Year — Advanced specialization subjects, electives, design-oriented. Include industry context. Prepare for placements and higher studies.',
  mtech: 'M.Tech / Research Scholar — Advanced theoretical depth, research methodology, paper references, advanced analysis techniques. Include current research context.',
  gate_aspirant: 'GATE Aspirant — Exam-focused, previous year problems, shortcut methods, high-weightage topics. Cover standard GATE syllabus depth. Time-efficient approaches.',
  working_engineer: 'Working Engineer / Professional — Practical application, industry standards (IS, ASME, IEEE), project context, refresher of fundamentals for professional development.',
};

class EngineeringLearningService {
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
      logger.error('OpenRouter API error (EngineeringLearning)', { status: response.status, error: errorText });

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

  async generateEngineeringContent(userId: string, params: {
    topic: string;
    mode?: string;
    branch?: string;
    userLevel?: string;
    standard?: string;
    difficulty?: string;
    examType?: string;
    semester?: string;
  }): Promise<FormattedResponse> {
    const { topic, mode, branch, userLevel, standard, difficulty, examType, semester } = params;

    if (!topic || !topic.trim()) {
      throw new BadRequestError('Topic is required for engineering learning.');
    }

    const ctx = resolveUserIntent({
      userType: 'student',
      domain: 'engineering',
      standard: standard || 'indian',
      outputMode: mode === 'quiz_mode' ? 'quiz' : mode === 'gate_prep' ? 'exam_answer' : mode === 'formula_revision' ? 'revision' : 'learn',
      difficulty,
      module: 'engineering_learning',
      examType,
    });

    const engMode: EngineeringMode = isValidEngMode(mode) ? mode : 'concept_explain';
    const engBranch: EngineeringBranch = isValidBranch(branch) ? branch : 'general';
    const engLevel: EngineeringUserLevel = isValidLevel(userLevel) ? userLevel : 'btech_1_2';

    const standardCtx = resolveAnswerStandard(
      standard as AnswerStandard || undefined,
      'study_assistant',
      examType
    );

    const systemPrompt = this.buildEngineeringSystemPrompt(engMode, engBranch, engLevel, ctx, standardCtx);

    let userPrompt = `Topic: ${topic}`;
    if (semester) userPrompt += `\nSemester: ${semester}`;
    if (examType) userPrompt += `\nExam Context: ${examType}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const content = await this.callOpenRouter(messages, undefined, {
      maxTokens: 4096,
      temperature: engMode === 'quiz_mode' ? 0.6 : engMode === 'coding_practice' ? 0.3 : 0.4,
    });

    return formatResponse(content, ctx, 'engineering_learning', {
      topic,
      mode: engMode,
      branch: engBranch,
      userLevel: engLevel,
      semester: semester || null,
      examType: examType || null,
    });
  }

  private buildEngineeringSystemPrompt(
    mode: EngineeringMode,
    branch: EngineeringBranch,
    level: EngineeringUserLevel,
    ctx: BoundaryContext,
    standardCtx: StandardContext
  ): string {
    const modeInstruction = ENGINEERING_MODE_INSTRUCTIONS[mode];
    const branchContext = BRANCH_CONTEXT[branch];
    const levelContext = LEVEL_CONTEXT[level];

    const standardSection = ctx.standard === 'indian'
      ? `
INDIAN ENGINEERING STANDARD:
- Reference Indian textbooks (RK Jain, PK Nag, Khurmi, SS Rattan, Cormen, CLRS)
- GATE / ESE / ISRO / university exam patterns
- IS (Indian Standards) codes where applicable
- AICTE curriculum alignment
- State board / CBSE / ICSE patterns for 10th-12th
- JEE Main & Advanced patterns for 11th-12th MPC
- Indian Engineering Services (IES) patterns
- Use SI units primarily`
      : ctx.standard === 'international'
      ? `
INTERNATIONAL ENGINEERING STANDARD:
- Reference global textbooks (Shigley, Cengel, Kreith, Sedra & Smith)
- FE/PE exam patterns (NCEES)
- ASME, IEEE, ISO standards
- GRE subject test patterns
- Use both SI and Imperial units`
      : `
HYBRID ENGINEERING STANDARD:
- Blend Indian and international references
- Compare IS vs ASME/ISO standards where differences exist
- Use both Indian and international textbook references
- GATE + FE exam preparation focus`;

    return `You are SRP Education AI — Engineering & MPC Learning Assistant.
You provide EDUCATIONAL engineering, mathematics, physics, and chemistry content to students and professionals.
${buildBoundaryContextPrompt(ctx)}
${buildStandardPromptSection(standardCtx)}

LEARNER PROFILE: ${levelContext}

BRANCH: ${branchContext}
${standardSection}

RESPONSE MODE: ${mode.toUpperCase().replace(/_/g, ' ')}
${modeInstruction}

${buildContentPolicyPrompt('engineering')}

LANGUAGE & SIMPLICITY (CRITICAL):
- Use simple everyday English. Say "use" not "utilise", "find" not "determine", "break" not "fracture" (unless it is a technical term).
- If a technical/engineering term is used, explain it in brackets on first use: "Torque (the twisting force that rotates something — like turning a bottle cap)"
- Match language to student level:
  • Class 10-12: Very simple, lots of daily-life analogies (bikes, fans, phones, cricket)
  • Diploma/B.Tech 1-2: Clear language, introduce technical terms with brief explanations
  • B.Tech 3-4/M.Tech/GATE: Standard engineering language, assume field knowledge
- Include at least one real-life example per concept (Indian context preferred)
- Use bullet points and numbered lists — avoid long paragraphs
- Use tables and visual comparisons wherever possible

ENGINEERING EDUCATION RULES:
1. ALL mathematical formulas MUST use LaTeX with dollar signs: $F = ma$, $$\\sum F = 0$$
2. Show EVERY step in numerical solutions — never skip intermediate steps.
3. Include units in all calculations and final answers.
4. Reference standard textbooks and exam patterns.
5. For design problems, reference applicable codes (IS, ASME, IEEE).
6. Lab/practical content is educational — always follow institution's lab manual.
7. Code solutions should be clean, commented, and follow best practices.
8. GATE questions should reference year and paper if known.
9. For 10th-12th students, keep language simple and use real-life analogies.
10. Project guidance is educational — actual implementation must be supervised by faculty.

FORMATTING:
- Use markdown headings (##, ###) for structure
- Use **bold** for key terms, formulas, and important facts
- Use bullet points for lists
- Use tables for comparisons and data
- Use code blocks (\`\`\`) for programming content
- Use LaTeX for ALL mathematical expressions
- Number procedural and solution steps clearly
- Use 📌 for important points, 💡 for tips, ⚠️ for common mistakes`;
  }
}

function isValidEngMode(v?: string): v is EngineeringMode {
  const modes: EngineeringMode[] = ['concept_explain', 'solve_numericals', 'lab_viva_prep', 'design_problems', 'formula_revision', 'quiz_mode', 'gate_prep', 'project_guidance', 'coding_practice'];
  return !!v && modes.includes(v as EngineeringMode);
}

function isValidBranch(v?: string): v is EngineeringBranch {
  const branches: EngineeringBranch[] = ['cse', 'ece', 'eee', 'mechanical', 'civil', 'it', 'chemical', 'marine', 'aerospace', 'automobile', 'biomedical', 'general'];
  return !!v && branches.includes(v as EngineeringBranch);
}

function isValidLevel(v?: string): v is EngineeringUserLevel {
  const levels: EngineeringUserLevel[] = ['class_10', 'class_11_12', 'diploma', 'btech_1_2', 'btech_3_4', 'mtech', 'gate_aspirant', 'working_engineer'];
  return !!v && levels.includes(v as EngineeringUserLevel);
}

export const engineeringLearningService = new EngineeringLearningService();
