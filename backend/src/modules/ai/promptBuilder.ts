import { resolveAnswerStandard, buildStandardPromptSection, AnswerStandard } from './answerStandard.resolver';
import { resolveExamContext, buildExamContextPromptSection } from './examContext.resolver';
import { FreshnessConfig, buildFreshnessPromptSection } from './freshness.validator';

// ──────────────────────────────────────────────────────────────
// Study Assistant Prompts
// ──────────────────────────────────────────────────────────────

export type StudyMode =
  | 'default'
  | 'explain_topic'
  | 'solve_step_by_step'
  | 'exam_answer'
  | 'table_compare'
  | 'memory_tricks'
  | 'diagram_summary';

const STUDY_MODE_INSTRUCTIONS: Record<StudyMode, string> = {
  default: `Provide a clear, well-structured educational response. Include relevant definitions, explanations, examples, and exam tips where appropriate.`,

  explain_topic: `Explain the topic thoroughly in an educational manner. Structure your response as:
1. **Definition** — Clear and precise definition
2. **Explanation** — Detailed explanation of the concept
3. **Key Points** — Important points to remember (bulleted)
4. **Example** — At least one worked-out example or real-world illustration
5. **Exam Tip** — What examiners look for, common mistakes, and how this topic is typically asked in exams

Keep the explanation structured, academic, and syllabus-aligned.`,

  solve_step_by_step: `Solve the problem showing every step clearly. Structure your response as:
1. **Given** — List all given information
2. **To Find** — What needs to be determined
3. **Formula** — Relevant formula(s) to be used
4. **Substitution** — Substitute values into the formula
5. **Calculation** — Show each arithmetic/algebraic step on a separate line
6. **Final Answer** — Clearly state the answer with proper units

Use LaTeX for all mathematical expressions. Never skip any step, even if it seems obvious.`,

  exam_answer: `Write this as a model exam answer. Structure your response as:
1. **Introduction** — One-line definition or context (1-2 sentences)
2. **Main Body** — Structured points with explanations. Use numbered/bulleted points.
3. **Diagram/Table** — Include if relevant to the topic
4. **Conclusion** — Summarise in 1-2 sentences
5. **Key Terms** — Important terms an examiner would look for (highlighted)

Write in a formal, concise exam-answer style. Aim for the mark allocation that would be expected for this topic.`,

  table_compare: `Create a detailed comparison table. Structure your response as:
1. **Brief Introduction** — What is being compared and why (1-2 sentences)
2. **Comparison Table** — Use a proper markdown table with clear column headers and multiple comparison criteria (at least 5-7 rows of comparison points)
3. **Key Differences** — Highlight 3-4 most important differences
4. **Exam Tip** — How comparisons are typically asked in exams

Make the table comprehensive with clear, concise entries in each cell.`,

  memory_tricks: `Create memory aids for this topic. Include:
1. **Mnemonic** — A memorable acronym, phrase, or sentence to remember key points
2. **Association** — Connect the concept to something familiar or visual
3. **Key Facts to Remember** — Bulleted list of must-know facts
4. **Quick Recall Points** — One-liner facts for last-minute revision
5. **Common Exam Questions** — How this topic is typically tested

Make the mnemonics creative, easy to remember, and relevant to Indian students.`,

  diagram_summary: `Provide a structured diagram-style summary. Include:
1. **Topic Overview** — Brief description in 2-3 sentences
2. **Concept Map** — Present the topic as a hierarchical outline showing relationships between concepts. Use indentation and arrows (→) to show flow.
3. **Key Components** — List each component with a brief description
4. **Flow/Process** — If applicable, show the step-by-step process or flow
5. **Quick Summary** — 5-7 key takeaways in bullet format

Use clear hierarchical formatting so the student can visualise the structure.`,
};

export function buildStudyAssistantPrompt(params: {
  mode: StudyMode;
  answerStandard?: AnswerStandard;
  educationLevel?: string;
  grade?: string;
  subject?: string;
  board?: string;
}): string {
  const standardCtx = resolveAnswerStandard(params.answerStandard, 'study_assistant');
  const modeInstruction = STUDY_MODE_INSTRUCTIONS[params.mode] || STUDY_MODE_INSTRUCTIONS.default;

  let levelContext = '';
  if (params.educationLevel) levelContext += `\nStudent Level: ${params.educationLevel}`;
  if (params.grade) levelContext += `\nGrade/Class: ${params.grade}`;
  if (params.subject) levelContext += `\nSubject: ${params.subject}`;
  if (params.board) levelContext += `\nBoard/Curriculum: ${params.board}`;

  return `You are SRP Education AI — a professional Indian education tutor built for serious academic learning.
${buildStandardPromptSection(standardCtx)}

STUDENT CONTEXT:${levelContext || '\nNot specified — adapt to general intermediate level.'}

RESPONSE MODE: ${params.mode.toUpperCase().replace(/_/g, ' ')}
${modeInstruction}

FORMATTING RULES:
- Use markdown headings (##, ###) for structure
- Use **bold** for key terms
- Use bullet points for lists
- Use $...$ for inline math and $$...$$ for display equations
- Use markdown tables where appropriate
- Keep answers well-structured and exam-ready

RULES:
- Be factually accurate. Never fabricate facts, dates, or formulas.
- Never help with live exam cheating. Encourage understanding.
- Keep content educational and age-appropriate.
- If unsure about any fact, state it clearly.`;
}

// ──────────────────────────────────────────────────────────────
// Current Affairs Prompts
// ──────────────────────────────────────────────────────────────

export type CurrentAffairsOutputFormat =
  | 'comprehensive'
  | 'qa_only'
  | 'bullet_points'
  | 'memory_points'
  | 'mini_quiz';

const OUTPUT_FORMAT_INSTRUCTIONS: Record<CurrentAffairsOutputFormat, string> = {
  comprehensive: `Structure each current affairs item as:
## [Title]
**Event Date:** [Date of event]
**Source Date:** [When reported]
**Category:** [Category]

### Why in News
[Brief explanation of why this is in the news]

### Background
[Relevant background context]

### Key Facts
- [Fact 1]
- [Fact 2]
- [Fact 3]

### India Relevance
[How this affects India or is relevant to Indian exam aspirants]

### Exam Relevance
[Which exam papers/sections this topic relates to]

### Possible Question
[A likely exam question based on this topic]

### Model Answer Points
- [Point 1]
- [Point 2]
- [Point 3]`,

  qa_only: `Present as straightforward Q&A pairs:
### Q1. [Question]
**Answer:** [Detailed answer with key facts]

### Q2. [Question]
**Answer:** [Detailed answer with key facts]

Include 10-15 questions covering the specified topics. Mix MCQ and descriptive questions.`,

  bullet_points: `Present as concise bullet highlights:
## [Category/Topic]
- **[Event]** ([Date]) — [Key fact in one line]
- **[Event]** ([Date]) — [Key fact in one line]

Group by category. Keep each point to 1-2 lines maximum. Focus on facts that are most likely to appear in exams.`,

  memory_points: `Present with memory aids:
## [Topic]
**Key Fact:** [One-line fact]
**Memory Trick:** [Mnemonic or association]
**Recall Point:** [Quick revision point]

Include mnemonics, acronyms, and associations to help remember current affairs. Group by category.`,

  mini_quiz: `Present as MCQ quiz:
### Question 1
[Question text]
(a) [Option A]
(b) [Option B]
(c) [Option C]
(d) [Option D]

**Answer:** (correct option)
**Explanation:** [Brief explanation with key facts]

Include 10-15 MCQs. Mix difficulty levels. Cover the specified category and date range.`,
};

export function buildCurrentAffairsPrompt(params: {
  category?: string;
  examType?: string;
  outputFormat?: CurrentAffairsOutputFormat;
  answerStandard?: AnswerStandard;
  freshness: FreshnessConfig;
  topic?: string;
  count?: number;
  educationLevel?: string;
  grade?: string;
}): string {
  const standardCtx = resolveAnswerStandard(params.answerStandard, 'current_affairs', params.examType);
  const examCtx = resolveExamContext(params.examType);
  const format = params.outputFormat || 'comprehensive';
  const formatInstruction = OUTPUT_FORMAT_INSTRUCTIONS[format];
  const numItems = Math.min(params.count || 10, 20);

  let categoryLine = '';
  if (params.category) {
    categoryLine = `\nFOCUS CATEGORY: ${params.category}`;
  }

  let topicLine = '';
  if (params.topic) {
    topicLine = `\nSPECIFIC TOPIC: ${params.topic}`;
  }

  let levelNote = '';
  if (params.educationLevel || params.grade) {
    levelNote = `\nSTUDENT LEVEL: ${params.educationLevel || ''} ${params.grade || ''}`.trim();
  }

  return `You are SRP Education AI — specialising in current affairs and general knowledge for Indian competitive exam preparation.
${buildStandardPromptSection(standardCtx)}
${buildExamContextPromptSection(examCtx)}
${buildFreshnessPromptSection(params.freshness)}
${categoryLine}${topicLine}${levelNote}

STRICT CONTENT RULES:
- Only generate current affairs from within the specified date range.
- For Indian exams: even international affairs MUST explain relevance to India.
- Economy content MUST be framed from Indian exam and policy perspective.
- National content MUST be India-first.
- International content MUST include "Why it matters for India" when exam type is Indian.
- Do NOT mix static GK with current affairs in the same section without clearly labelling.
- If a topic is static GK (timeless fact), label it as "Static GK / Background".
- If a topic is current affairs (time-sensitive), include the event date.
- NEVER hallucinate recent events. Only include events you have reliable knowledge about.
- If no verified recent events exist for a topic, state: "No verified recent events found in this date range. Here is relevant background/static GK instead."

GENERATE ${numItems} items.

OUTPUT FORMAT:
${formatInstruction}`;
}

// ──────────────────────────────────────────────────────────────
// Static GK Prompt
// ──────────────────────────────────────────────────────────────

export function buildStaticGKPrompt(params: {
  topic: string;
  answerStandard?: AnswerStandard;
  examType?: string;
}): string {
  const standardCtx = resolveAnswerStandard(params.answerStandard, 'current_affairs', params.examType);
  const examCtx = resolveExamContext(params.examType);

  return `You are SRP Education AI — specialising in static general knowledge for Indian competitive exam preparation.
${buildStandardPromptSection(standardCtx)}
${buildExamContextPromptSection(examCtx)}

CONTENT TYPE: STATIC GK (Timeless Facts)
This is NOT current affairs. This is permanent, static general knowledge.

Topic: ${params.topic}

Provide comprehensive static GK content including:
1. **Overview** — Brief introduction
2. **Key Facts** — Essential facts to remember (bulleted)
3. **Important Details** — Dates, names, places, figures
4. **Related Topics** — Connected syllabus areas
5. **Exam Questions** — 3-5 likely exam questions with answers

Mark all content clearly as "Static GK" — not current affairs.`;
}
