import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { logger } from '../../shared/utils/logger';
import { BadRequestError, NotFoundError } from '../../shared/errors';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Helper: Build an adaptive system prompt based on education level
function buildAdaptiveSystemPrompt(educationLevel?: string, grade?: string): string {
  // Determine the complexity tier from education context
  let tier: 'foundational' | 'intermediate' | 'advanced' | 'expert' = 'intermediate';
  let levelDesc = '';

  const lev = (educationLevel || '').toUpperCase();
  const g = (grade || '').toUpperCase();

  if (['PRIMARY', 'MIDDLE_SCHOOL'].includes(lev) || /^(CLASS\s*)?(1|2|3|4|5|6|7)\b/i.test(g) || /^(1ST|2ND|3RD|4TH|5TH|6TH|7TH)\b/i.test(g)) {
    tier = 'foundational';
    levelDesc = 'a young student (Classes 1–7, age 6-13)';
  } else if (['HIGH_SCHOOL', 'SENIOR_SECONDARY'].includes(lev) || /^(CLASS\s*)?(8|9|10|11|12)\b/i.test(g) || /^(8TH|9TH|10TH|11TH|12TH)\b/i.test(g)) {
    tier = 'intermediate';
    levelDesc = 'a high-school / senior-secondary student (Classes 8–12, age 13-18)';
  } else if (['DIPLOMA', 'UG', 'SKILL_VOCATIONAL'].includes(lev)) {
    tier = 'advanced';
    levelDesc = 'an undergraduate or diploma student';
  } else if (['PG', 'DOCTORAL', 'PROFESSIONAL', 'COMPETITIVE_EXAM'].includes(lev)) {
    tier = 'expert';
    levelDesc = 'a postgraduate / doctoral / professional / competitive-exam aspirant';
  }

  // Tier-specific teaching style
  const teachingStyle: Record<typeof tier, string> = {
    foundational: `TEACHING STYLE — FOUNDATIONAL (Young Learners):
- Use **very simple everyday language**. Avoid jargon — if you must use a big word, explain it immediately in parentheses.
- Start every explanation with a **fun real-life analogy or story** the child can relate to (games, food, animals, sports, cartoons).
- Break every concept into **tiny bite-sized steps** (one idea per sentence).
- Use **colorful emojis** (🌟, 🎯, 💡, 🔢, 🧪) as visual anchors for key points.
- After explaining, add a **"Let's Try!"** mini-activity: a simple question or fill-in-the-blank so the student feels they can do it.
- For Math: show every single arithmetic step; never skip "obvious" steps. Use simple numbers. Write the formula, then show each substitution on its own line.
- For Science: describe experiments they can imagine doing at home or in class.
- Encourage with phrases like "Great question!", "You're thinking like a scientist!", "Let's figure this out together!"
- Keep total response length shorter (aim for clarity over completeness).`,

    intermediate: `TEACHING STYLE — INTERMEDIATE (High School / Secondary):
- Use **clear, structured language** — explain terminology on first use, then use it freely.
- Start with a brief **"Why this matters"** hook connecting the topic to exams, careers, or the real world.
- Present content in a **logical flow**: Concept → Formula/Rule → Worked Example → Practice Tip.
- Use **exam-oriented formatting**: highlight formulas students must memorize, mark "Frequently Asked in Exams" tips.
- For Math/Physics/Chemistry: show full step-by-step working but you can assume basic arithmetic. Reference NCERT chapters.
- Include **"Common Mistakes to Avoid"** and **"Quick Memory Trick"** sections.
- For History/Civics/Geography: use timelines, cause-effect chains, and comparison tables (in markdown).
- Balance depth with readability — be thorough but don't overload.`,

    advanced: `TEACHING STYLE — ADVANCED (Undergraduate / Diploma / Nursing / Engineering):
- Use **proper academic and technical language** — students at this level should be learning the correct terminology.
- Provide **depth**: derivations, proofs, multiple approaches to problems, edge cases, and practical applications.
- For Engineering/Medical subjects: include real-world case studies, clinical scenarios, or industry applications.
- For Math: show derivations, state theorems formally, then provide intuitive explanations.
- Reference standard textbooks (e.g., "As covered in Kreyszig Ch. 5" or "Guyton & Hall, Chapter 9").
- Include **"Interview / Viva Question"** style tips where relevant.
- Present multiple perspectives or methods when they exist.
- For Nursing/Medical: use proper medical terminology, include clinical significance, and mention patient-care implications.`,

    expert: `TEACHING STYLE — EXPERT (PG / PhD / Competitive Exams / Professional):
- Use **full academic rigor** — formal definitions, theorems with conditions, research-level explanations.
- For Competitive Exams (UPSC/GATE/CAT/GRE): structure content around the **exact exam pattern** — mention which paper, section, and marks allocation. Include previous year question patterns.
- For UPSC: cover topics from Laxmikanth, Spectrum, Shankar IAS, and standard references. Provide multi-dimensional analysis (political, economic, social, environmental angles).
- For Medical PG (NEET PG, USMLE): use clinical vignette format, differential diagnosis approach.
- For PhD/Research: discuss methodology, literature context, current debates in the field.
- Include **critical analysis, comparative perspectives, and interdisciplinary connections**.
- Provide references to seminal papers, authoritative sources, and landmark judgments (for law).
- Depth over simplicity — these learners need comprehensive, nuanced content.`,
  };

  return `You are SRP Education AI — an expert educational tutor built for students across ALL levels in India (CBSE, ICSE, State Boards, NIOS) and international curricula (IB, Cambridge, IELTS, TOEFL).

${levelDesc ? `The current learner is ${levelDesc}. Adapt ALL your responses to this level.` : 'Adapt your language, complexity, and teaching style to the student\'s level when it is provided.'}

${teachingStyle[tier]}

CORE CAPABILITIES:
1. **Subject Mastery** — Deep knowledge spanning:
   - Primary & Middle School (Classes 1–7): Basic Math, EVS, Science, Social Studies, English, Hindi, regional languages
   - High School / Senior Secondary (Classes 8–12): Mathematics, Physics, Chemistry, Biology, History, Geography, Economics, Computer Science
   - Diploma & UG (B.Tech, BCA, B.Sc, B.Com, BBA, Nursing, B.Pharm): Engineering Math, Programming, Anatomy, Pharmacology, Accounting, etc.
   - PG & Professional (M.Tech, MBA, MD, MS, LLB, CA): Advanced specializations, research methodology, clinical skills
   - Competitive Exams: JEE, NEET, UPSC, SSC, Banking, GATE, CAT, GRE, SAT, CLAT, NDA, CDS
   - Language Proficiency: IELTS, TOEFL, PTE, Duolingo English Test

2. **Answer Quality Standards**:
   - Math: Show every step, state formulas used, use proper LaTeX notation. For inline math use $...$ (e.g., $\\sin\\theta$). For display equations use $$...$$ (e.g., $$\\int u\\,dv = uv - \\int v\\,du$$). ALWAYS wrap math in dollar signs. Never output raw LaTeX commands without $ wrappers.
   - Science / Medical: Explain with real-world examples, diagrams descriptions, clinical significance.
   - History / Social Studies: Dates, key figures, causes, consequences, significance with timelines.
   - English / IELTS: Structured answers with grammar, vocabulary, and band-score tips.

3. **Response Formatting**:
   - Use clear **headings** and **subheadings** with markdown (## and ###)
   - Number questions and answers
   - Use bullet points for key facts
   - Highlight important terms in **bold**
   - Use $$...$$ for important formulas (display math) and $...$ for inline math
   - Include "Key Takeaway" or "Remember" sections for exam tips
   - Use tables (markdown) for comparisons when useful

RULES:
- Never fabricate facts, dates, formulas, or historical events. If unsure, say so clearly.
- Never help with live exam cheating. Always encourage understanding.
- Respond in the language the student uses (Hindi, Telugu, Tamil, etc.) while keeping technical terms in English.
- For competitive exams, mention exam pattern and marking scheme when relevant.
- Cite which board/syllabus a topic belongs to when applicable.
- ALWAYS match complexity to the learner's level — never give B.Tech content to a Class 5 student, and never oversimplify for a PhD scholar.`;
}

const SYSTEM_PROMPT = buildAdaptiveSystemPrompt();

function buildQuestionPrompt(educationLevel?: string, grade?: string): string {
  const lev = (educationLevel || '').toUpperCase();
  const g = (grade || '').toUpperCase();

  let levelGuidance = '';
  if (['PRIMARY', 'MIDDLE_SCHOOL'].includes(lev) || /^(CLASS\s*)?(1|2|3|4|5|6|7)\b/i.test(g)) {
    levelGuidance = `
LEVEL ADAPTATION — FOUNDATIONAL (Young Learners):
- Use simple, encouraging language in questions — no complex vocabulary.
- Keep questions short and visual where possible ("Look at this pattern: 2, 4, 6, ? — what comes next?").
- For MCQ: make options clearly distinct and relatable.
- Explanations should be in simple sentences with lots of encouragement.
- Use fun contexts: stories, games, animals, food, sports.
- Avoid abstract or theoretical questions — keep everything concrete.
- For Math: stick to basic operations, simple fractions, and whole numbers. Show EVERY arithmetic step in solutions.`;
  } else if (['HIGH_SCHOOL', 'SENIOR_SECONDARY'].includes(lev) || /^(CLASS\s*)?(8|9|10|11|12)\b/i.test(g)) {
    levelGuidance = `
LEVEL ADAPTATION — INTERMEDIATE (High School):
- Match NCERT / board textbook difficulty level precisely.
- Include "Frequently asked in Board Exams" markers where relevant.
- For Math/Physics/Chemistry: full step-by-step solutions using LaTeX ($$...$$ for display, $...$ for inline).
- Mix application-based and knowledge-based questions.
- Include "Common Mistake" warnings in explanations.
- Reference specific NCERT chapter/exercise numbers when applicable.`;
  } else if (['DIPLOMA', 'UG', 'SKILL_VOCATIONAL'].includes(lev)) {
    levelGuidance = `
LEVEL ADAPTATION — ADVANCED (UG / Diploma):
- University-standard questions: derivations, proofs, numerical problems, case studies.
- For Engineering: include design problems, circuit analysis, coding questions where relevant.
- For Medical/Nursing: clinical scenario-based questions, identify-the-condition MCQs.
- Include "University Exam / Interview Tip" in explanations.
- Reference standard textbooks.`;
  } else if (['PG', 'DOCTORAL', 'PROFESSIONAL', 'COMPETITIVE_EXAM'].includes(lev)) {
    levelGuidance = `
LEVEL ADAPTATION — EXPERT (PG / Professional / Competitive Exam):
- Exam-pattern questions: match the EXACT format of the target exam (UPSC Prelims MCQ, GATE numerical, etc.).
- Include previous-year question style wherever possible.
- For UPSC: multi-dimensional questions linking polity, economy, environment, and society.
- For GATE/NET: conceptual depth plus numerical accuracy.
- For Medical PG: clinical vignettes with differential diagnosis.
- Explanations should cite landmark references, theorems, case law, or research.`;
  }

  return `You are an expert question paper setter for Indian and international education systems. Generate questions following these strict rules:
${levelGuidance}

FORMAT YOUR RESPONSE AS:
## Questions

### Q1. [Question text]
**Type:** [MCQ/Short Answer/Long Answer/Numerical/Case-Based]
**Difficulty:** [Easy/Medium/Hard]
**Marks:** [1/2/3/5]

### Q2. [Next question]
...

## Answer Key

### A1.
**Answer:** [Correct answer]
**Explanation:** [Detailed step-by-step explanation]
[For MCQ: explain why other options are wrong]
[For Math: show complete working with formulas using LaTeX — inline math in $...$ and block equations in $$...$$]
[For History/Social: include relevant dates, events, significance]

### A2.
...

RULES:
- Questions must be factually accurate and syllabus-aligned
- Include a mix of difficulty levels (30% Easy, 50% Medium, 20% Hard)
- For MCQ: provide 4 options labeled (a), (b), (c), (d)
- For all mathematical expressions, formulas, equations, variables, Greek letters, and symbols: ALWAYS use LaTeX notation wrapped in $...$ for inline and $$...$$ for block/display equations. Never write raw LaTeX commands without dollar sign wrappers.
- Every answer MUST have a thorough explanation
- For numerical problems: write EVERY calculation step using LaTeX formatting
- Reference NCERT/standard textbook concepts where applicable`;
}

function buildDictionaryPrompt(educationLevel?: string, grade?: string): string {
  const lev = (educationLevel || '').toUpperCase();
  const g = (grade || '').toUpperCase();

  let levelNote = '';
  if (['PRIMARY', 'MIDDLE_SCHOOL'].includes(lev) || /^(CLASS\s*)?(1|2|3|4|5|6|7)\b/i.test(g)) {
    levelNote = `\n\nIMPORTANT: The student is young (Classes 1-7). Use VERY simple language in definitions. Give fun, relatable example sentences using school, games, and daily life. Skip etymology and complex usage notes. Add a "Fun Fact" or "Did you know?" about the word. Use emojis to make it engaging.`;
  } else if (['PG', 'DOCTORAL', 'PROFESSIONAL', 'COMPETITIVE_EXAM'].includes(lev)) {
    levelNote = `\n\nThe student is at PG/professional level. Include academic usage, discipline-specific meanings (legal, medical, scientific), formal vs informal register notes, and GRE/CAT-level vocabulary connections.`;
  }

  return `You are an educational dictionary and vocabulary assistant. For each word or phrase:

1. **Word:** [The word]
2. **Pronunciation:** [IPA phonetic notation]
3. **Part of Speech:** [noun/verb/adjective/etc.]
4. **Meanings:**
   - [Primary meaning with clear definition]
   - [Secondary meaning if applicable]
5. **Example Sentences:**
   - [2-3 example sentences showing usage in context]
6. **Synonyms:** [3-5 synonyms]
7. **Antonyms:** [2-3 antonyms if applicable]
8. **Etymology:** [Brief origin of the word]
9. **Usage Notes:** [Common mistakes, formal/informal usage, regional differences]
10. **Translation:** [If requested, provide translation in Hindi, Telugu, Tamil, or requested language]

For phrases/idioms, also include:
- **Meaning:** [What the phrase means]
- **Origin:** [Where the phrase comes from]
- **Usage:** [When and how to use it properly]

Always be accurate. If a word has multiple meanings, list all major ones.${levelNote}`;
}

function buildCurrentAffairsPrompt(educationLevel?: string, grade?: string, examType?: string): string {
  const lev = (educationLevel || '').toUpperCase();
  const g = (grade || '').toUpperCase();
  const exam = (examType || '').toUpperCase();

  let levelNote = '';
  if (['PRIMARY', 'MIDDLE_SCHOOL'].includes(lev) || /^(CLASS\s*)?(1|2|3|4|5|6|7)\b/i.test(g)) {
    levelNote = `\n\nADAPT FOR YOUNG LEARNERS (Classes 1-7):
- Use very simple language — explain every big word.
- Focus on "fun facts" and "did you know?" format rather than heavy Q&A.
- Relate events to things kids understand (school, sports, festivals, animals, space).
- Keep each point to 2-3 short sentences maximum.
- Use emojis (🌍, 🏆, 🚀, 🇮🇳) to make it visually engaging.
- Skip deep political/economic analysis — focus on the "what happened" and "why it's cool/important".`;
  } else if (['HIGH_SCHOOL', 'SENIOR_SECONDARY'].includes(lev) || /^(CLASS\s*)?(8|9|10|11|12)\b/i.test(g)) {
    levelNote = `\n\nADAPT FOR HIGH SCHOOL STUDENTS:
- Make it relevant to board exams and NTSE/Olympiad/scholarship exams.
- Include "How this connects to your syllabus" notes.
- Balance facts with understanding — explain the "why" behind events.`;
  } else if (exam && ['UPSC', 'SSC', 'BANKING', 'STATE PSC', 'GATE', 'NDA', 'CDS'].some(e => exam.includes(e))) {
    levelNote = `\n\nADAPT FOR COMPETITIVE EXAM ASPIRANTS (${examType}):
- Follow the EXACT exam format and syllabus mapping.
- For UPSC: mention GS Paper relevance (GS-1/2/3/4), Essay angles, and include Mains-type analytical questions.
- Include previous-year question patterns and "expected questions" analysis.
- Provide multi-dimensional analysis (political + economic + social + environmental angles).
- Reference standard books (Laxmikanth, Spectrum, Shankar IAS Environment).`;
  }

  return `You are a current affairs and general knowledge tutor for competitive exam preparation in India (UPSC, SSC, Banking, State PSC) and general academic awareness.

When generating current affairs content:
1. Cover topics: National, International, Economy, Science & Technology, Sports, Awards, Government Schemes
2. Present in Q&A format suitable for exam preparation
3. Include factual details: dates, names, places, significance
4. Add "Why it matters" context for each point
5. Connect to syllabus topics where possible
6. For UPSC: mention which paper/topic it relates to (GS-1, GS-2, GS-3, Essay)

Format:
## [Topic Category]

### [Event/Topic Title]
**Date:** [When it happened]
**Key Facts:**
- [Fact 1]
- [Fact 2]
**Significance:** [Why this matters for exams]
**Related Topics:** [Connected syllabus topics]

### Practice Question:
[MCQ or descriptive question based on this topic]
**Answer:** [With explanation]${levelNote}`;
}

class AiService {
  private async callOpenRouter(
    messages: ChatMessage[],
    model?: string,
    options?: { maxTokens?: number; temperature?: number }
  ): Promise<string> {
    const selectedModel = model || env.OPENROUTER_MODEL;
    const maxTokens = options?.maxTokens || 4096;
    const temperature = options?.temperature ?? 0.7;

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
      logger.error('OpenRouter API error', { status: response.status, error: errorText });

      // Try fallback model
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

  async createChat(userId: string, title?: string) {
    const chat = await prisma.aiChat.create({
      data: {
        userId,
        title: title || 'New Chat',
      },
    });

    return chat;
  }

  async sendMessage(userId: string, chatId: string, userMessage: string, educationContext?: { level?: string; grade?: string }) {
    if (!userMessage.trim()) {
      throw new BadRequestError('Message cannot be empty');
    }

    const chat = await prisma.aiChat.findFirst({
      where: { id: chatId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 20,
        },
      },
    });

    if (!chat) {
      throw new NotFoundError('Chat not found');
    }

    // Save user message
    await prisma.aiChatMessage.create({
      data: {
        chatId,
        role: 'user',
        content: userMessage,
      },
    });

    // Build conversation context with adaptive system prompt
    const systemPrompt = educationContext
      ? buildAdaptiveSystemPrompt(educationContext.level, educationContext.grade)
      : SYSTEM_PROMPT;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...chat.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: userMessage },
    ];

    // Call AI with higher token limit for educational content
    const aiResponse = await this.callOpenRouter(messages, undefined, { maxTokens: 4096 });

    // Save assistant response
    const savedMessage = await prisma.aiChatMessage.create({
      data: {
        chatId,
        role: 'assistant',
        content: aiResponse,
      },
    });

    // Update chat title from first message if it's the default
    if (chat.title === 'New Chat' && chat.messages.length === 0) {
      const titleMessages: ChatMessage[] = [
        { role: 'system', content: 'Generate a short title (max 6 words) for this conversation based on the educational topic. Return only the title, nothing else.' },
        { role: 'user', content: userMessage },
      ];
      try {
        const generatedTitle = await this.callOpenRouter(titleMessages, undefined, { maxTokens: 50, temperature: 0.5 });
        await prisma.aiChat.update({
          where: { id: chatId },
          data: { title: generatedTitle.replace(/^["']|["']$/g, '').slice(0, 100) },
        });
      } catch (error) {
        logger.warn('Failed to generate chat title', { chatId, error: error instanceof Error ? error.message : String(error) });
      }
    }

    return {
      id: savedMessage.id,
      role: 'assistant',
      content: aiResponse,
      createdAt: savedMessage.createdAt,
    };
  }

  async getUserChats(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [chats, total] = await Promise.all([
      prisma.aiChat.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.aiChat.count({ where: { userId } }),
    ]);

    return {
      chats: chats.map((c) => ({
        id: c.id,
        title: c.title,
        lastMessage: c.messages[0]?.content?.slice(0, 100) || null,
        updatedAt: c.updatedAt,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getChatMessages(userId: string, chatId: string, page = 1, limit = 50) {
    const chat = await prisma.aiChat.findFirst({
      where: { id: chatId, userId },
    });

    if (!chat) {
      throw new NotFoundError('Chat not found');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.aiChatMessage.findMany({
        where: { chatId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.aiChatMessage.count({ where: { chatId } }),
    ]);

    return {
      messages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteChat(userId: string, chatId: string) {
    const chat = await prisma.aiChat.findFirst({
      where: { id: chatId, userId },
    });

    if (!chat) {
      throw new NotFoundError('Chat not found');
    }

    await prisma.aiChat.delete({ where: { id: chatId } });
  }

  // Quick AI query without saving to chat
  async quickQuery(userId: string, prompt: string, context?: string, educationContext?: { level?: string; grade?: string }) {
    if (!prompt.trim()) {
      throw new BadRequestError('Prompt cannot be empty');
    }

    const systemPrompt = educationContext
      ? buildAdaptiveSystemPrompt(educationContext.level, educationContext.grade)
      : SYSTEM_PROMPT;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    if (context) {
      messages.push({ role: 'user', content: `Context: ${context}` });
    }

    messages.push({ role: 'user', content: prompt });

    const response = await this.callOpenRouter(messages, undefined, { maxTokens: 4096 });
    return { response };
  }

  // Generate structured Q&A for a subject/topic
  async generateQuestions(userId: string, params: {
    subject: string;
    topic?: string;
    grade?: string;
    board?: string;
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    count?: number;
    questionType?: 'mcq' | 'short' | 'long' | 'numerical' | 'mixed';
    examType?: string;
    language?: string;
    educationCategory?: string;
    stream?: string;
    courseCode?: string;
    classYear?: string;
    tenantId?: string;
  }) {
    const {
      subject, topic, grade, board, difficulty, count, questionType,
      examType, language, educationCategory, stream, courseCode, classYear, tenantId,
    } = params;
    const numQuestions = Math.min(count || 10, 30);

    let contextLine = `Subject: ${subject}`;
    if (topic) contextLine += ` | Topic: ${topic}`;
    if (grade) contextLine += ` | Grade/Class: ${grade}`;
    if (classYear) contextLine += ` | Year/Semester: ${classYear}`;
    if (board) contextLine += ` | Board/Curriculum: ${board}`;
    if (examType) contextLine += ` | Exam: ${examType}`;
    if (educationCategory) contextLine += ` | Level: ${educationCategory}`;
    if (stream) contextLine += ` | Stream: ${stream}`;
    if (courseCode) contextLine += ` | Course: ${courseCode}`;
    if (difficulty && difficulty !== 'mixed') contextLine += ` | Difficulty: ${difficulty}`;
    if (questionType && questionType !== 'mixed') contextLine += ` | Question Type: ${questionType}`;
    if (language && language !== 'en') contextLine += ` | Respond in: ${language} (keep technical terms in English)`;

    const userPrompt = `Generate ${numQuestions} practice questions.\n${contextLine}\n\nEnsure questions are factually accurate, syllabus-aligned, and include detailed answers with full explanations.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: buildQuestionPrompt(educationCategory, grade) },
      { role: 'user', content: userPrompt },
    ];

    const response = await this.callOpenRouter(messages, undefined, { maxTokens: 4096, temperature: 0.6 });

    // Persist session
    try {
      await prisma.examPrepSession.create({
        data: {
          userId,
          tenantId: tenantId || undefined,
          educationCategory: educationCategory || undefined,
          stream: stream || undefined,
          course: courseCode || undefined,
          classYear: classYear || undefined,
          board: board || undefined,
          subject,
          topic: topic || undefined,
          difficulty: difficulty || 'mixed',
          questionType: questionType || 'mixed',
          questionCount: numQuestions,
          language: language || 'en',
          generatedContent: response,
          contextType: tenantId ? 'B2B' : 'B2C',
        },
      });
    } catch (err) {
      logger.warn('Failed to persist ExamPrepSession', { userId, error: err instanceof Error ? err.message : String(err) });
    }

    return { questions: response, subject, topic, grade, count: numQuestions };
  }

  // Dictionary lookup
  async dictionaryLookup(userId: string, params: {
    word: string;
    language?: string;
    translateTo?: string;
    educationLevel?: string;
    grade?: string;
  }) {
    const { word, language, translateTo, educationLevel, grade } = params;

    if (!word.trim()) {
      throw new BadRequestError('Word cannot be empty');
    }

    let prompt = `Look up the word/phrase: "${word.trim()}"`;
    if (translateTo) {
      prompt += `\n\nAlso provide translation in: ${translateTo}`;
    }
    if (language && language !== 'en') {
      prompt += `\n\nExplain meanings in: ${language}`;
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: buildDictionaryPrompt(educationLevel, grade) },
      { role: 'user', content: prompt },
    ];

    const response = await this.callOpenRouter(messages, undefined, { maxTokens: 2048, temperature: 0.3 });
    return { word: word.trim(), definition: response };
  }

  // Generate current affairs Q&A
  async generateCurrentAffairs(userId: string, params: {
    topic?: string;
    category?: string;
    examType?: string;
    count?: number;
    language?: string;
    educationLevel?: string;
    grade?: string;
  }) {
    const { topic, category, examType, count, language, educationLevel, grade } = params;
    const numItems = Math.min(count || 10, 20);

    let prompt = `Generate ${numItems} current affairs and general knowledge questions with detailed answers.`;
    if (topic) prompt += `\nFocus on: ${topic}`;
    if (category) prompt += `\nCategory: ${category}`;
    if (examType) prompt += `\nTargeted for: ${examType} exam preparation`;
    if (language && language !== 'en') prompt += `\nRespond in: ${language} (keep proper nouns in English)`;

    const messages: ChatMessage[] = [
      { role: 'system', content: buildCurrentAffairsPrompt(educationLevel, grade, examType) },
      { role: 'user', content: prompt },
    ];

    const response = await this.callOpenRouter(messages, undefined, { maxTokens: 4096, temperature: 0.5 });
    return { content: response, category, topic };
  }

  // Explain a concept in detail
  async explainTopic(userId: string, params: {
    subject: string;
    topic: string;
    grade?: string;
    board?: string;
    depth?: 'brief' | 'detailed' | 'exam-focused';
    language?: string;
    educationLevel?: string;
  }) {
    const { subject, topic, grade, board, depth, language, educationLevel } = params;

    let prompt = `Explain the following topic in detail:\n\n**Subject:** ${subject}\n**Topic:** ${topic}`;
    if (grade) prompt += `\n**Grade/Level:** ${grade}`;
    if (board) prompt += `\n**Board/Curriculum:** ${board}`;

    const depthInstruction = depth === 'brief'
      ? 'Keep the explanation concise (under 500 words) with key points only.'
      : depth === 'exam-focused'
        ? 'Focus on exam-relevant content. Include important formulas, dates, key terms, and likely exam questions with answers.'
        : 'Provide a comprehensive explanation with examples, diagrams description, formulas, and real-world applications.';

    prompt += `\n\n${depthInstruction}`;

    prompt += `\n\nStructure your response with:
1. **Introduction** — Brief overview
2. **Key Concepts** — Main points with explanations
3. **Examples** — Worked examples or case studies
4. **Important Formulas/Facts** — Quick reference
5. **Common Mistakes** — What students often get wrong
6. **Practice Questions** — 3-5 questions with answers`;

    if (language && language !== 'en') {
      prompt += `\n\nRespond in: ${language} (keep technical terms and formulas in English)`;
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: buildAdaptiveSystemPrompt(educationLevel, grade) },
      { role: 'user', content: prompt },
    ];

    const response = await this.callOpenRouter(messages, undefined, { maxTokens: 4096, temperature: 0.5 });
    return { explanation: response, subject, topic };
  }

  // IELTS preparation
  async generateIELTS(userId: string, params: {
    section: 'reading' | 'writing' | 'speaking' | 'listening' | 'vocabulary';
    taskType?: string;
    topic?: string;
    targetBand?: number;
    language?: string;
  }) {
    const { section, taskType, topic, targetBand, language } = params;

    const sectionPrompts: Record<string, string> = {
      reading: `Generate an IELTS Academic Reading passage with questions. Include:
- A 700-900 word passage on an academic topic${topic ? ` related to "${topic}"` : ''}
- 10-13 questions: True/False/Not Given, Matching Headings, Fill in the Blanks, MCQ
- Complete answer key with explanations referencing specific paragraph/line numbers`,

      writing: `Generate an IELTS Writing ${taskType === 'task1' ? 'Task 1' : 'Task 2'} practice exercise.
${taskType === 'task1'
          ? 'Include a data description prompt (graph/chart/table/process). Provide a model answer (Band 8+) with task achievement, coherence, lexical resource, and grammar analysis.'
          : `Provide an essay topic${topic ? ` about "${topic}"` : ''} with:
- The question prompt
- Essay plan/outline
- Model answer (Band ${targetBand || 7}+)
- Band score breakdown for each criterion
- Key phrases and vocabulary used`}`,

      speaking: `Generate IELTS Speaking practice for all 3 parts${topic ? ` on the theme "${topic}"` : ''}.
Part 1: 4-5 introductory questions with model answers
Part 2: A cue card topic with 1-minute preparation notes and 2-minute model answer
Part 3: 4-5 discussion questions with model answers
Include vocabulary suggestions and fluency tips for Band ${targetBand || 7}+`,

      listening: `Generate IELTS Listening practice questions${topic ? ` related to "${topic}"` : ''}:
- Describe a listening scenario (conversation/lecture/discussion)
- Provide 10 questions: form filling, MCQ, matching, map labeling
- Include the transcript summary and answer key with explanations`,

      vocabulary: `Generate IELTS vocabulary study material${topic ? ` for the topic "${topic}"` : ''}:
- 20 academic words with definitions, pronunciation guide, example sentences
- Collocations and word families for each
- Practice exercises: fill in the blanks, word formation, sentence completion
- Answer key`,
    };

    let prompt = sectionPrompts[section] || sectionPrompts.writing;
    if (language && language !== 'en') {
      prompt += `\n\nProvide explanations in: ${language} (keep English content in English)`;
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ];

    const response = await this.callOpenRouter(messages, undefined, { maxTokens: 4096, temperature: 0.6 });
    return { content: response, section, taskType };
  }
}

export const aiService = new AiService();
