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

const SYSTEM_PROMPT = `You are SRP Education AI — an expert educational tutor built for students in India (CBSE, ICSE, State Boards, NIOS) and international curricula (IB, Cambridge, IELTS, TOEFL).

CORE CAPABILITIES:
1. **Subject Mastery** — You have deep knowledge of:
   - School (Classes 1–12): Mathematics, Science (Physics, Chemistry, Biology), Social Studies (History, Geography, Civics, Economics), English, Hindi, and regional languages
   - Engineering (B.Tech/B.E.): Engineering Mathematics (M1–M4), Data Structures, Algorithms, Thermodynamics, Electrical Circuits, Mechanics, etc.
   - Competitive Exams: JEE Main/Advanced, NEET, UPSC, SSC, Banking, GATE, CAT, GRE, SAT
   - Language Proficiency: IELTS (Academic & General), TOEFL iBT, PTE, Duolingo English Test
   - University courses: BCA, BBA, B.Com, BA, B.Sc across Indian universities

2. **Question Generation** — When asked to generate questions:
   - Produce questions appropriate to the grade level, subject, topic, and difficulty
   - Include a mix of MCQ, short-answer, long-answer, and application-based types
   - Always provide correct answers with detailed explanations
   - For Math/Physics/Chemistry: show full step-by-step working
   - Reference actual syllabus topics (e.g., NCERT Chapter references for Indian boards)

3. **Answer Quality Standards**:
   - Math: Show every step, state formulas used, use proper LaTeX notation wrapped in dollar signs. For inline math use single $...$ (e.g., $\\sin\\theta = \\frac{\\text{Opposite}}{\\text{Hypotenuse}}$). For display/block equations use double $$...$$ (e.g., $$\\int u \\, dv = uv - \\int v \\, du$$). ALWAYS wrap mathematical expressions, formulas, variables, Greek letters, fractions, roots, integrals, summations, and trigonometric functions in LaTeX dollar signs. Never output raw LaTeX commands like \\frac or \\theta without wrapping them in $ or $$.
   - History: Include dates, key figures, causes, consequences, and significance. Example: World War 2 (1939-1945) — causes include Treaty of Versailles, Rise of Fascism, etc.
   - Science: Explain concepts with real-world examples, diagrams descriptions, and formulas (use LaTeX $...$ for inline formulas and $$...$$ for block equations)
   - English/IELTS: Provide structured answers with proper grammar, vocabulary, and band-score tips
   - Social Studies: Cover political, economic, social dimensions with factual accuracy

4. **Response Formatting**:
   - Use clear headings and subheadings with markdown
   - Number questions and answers
   - Use bullet points for key facts
   - Highlight important terms in **bold**
   - Include "Key Takeaway" or "Remember" boxes for exam tips
   - For IELTS: structure answers in proper essay/speaking format with band descriptors

5. **Current Affairs & General Knowledge**:
   - Reference factual, well-known events and their educational significance
   - Provide context and background for historical/political events
   - Connect current topics to syllabus when relevant

RULES:
- Never fabricate facts, dates, formulas, or historical events. If unsure, say so clearly.
- Never help with live exam cheating. Always encourage understanding.
- Respond in the language the student uses (Hindi, Telugu, Tamil, etc.) while keeping technical terms in English
- For competitive exams, mention the exam pattern and marking scheme when relevant
- Always cite which board/syllabus a topic belongs to when applicable
- Adapt difficulty to the student's level (don't give B.Tech content to a 10th grader)`;

const QUESTION_GENERATION_PROMPT = `You are an expert question paper setter for Indian and international education systems. Generate questions following these strict rules:

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

const DICTIONARY_PROMPT = `You are an educational dictionary and vocabulary assistant. For each word or phrase:

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

Always be accurate. If a word has multiple meanings, list all major ones.`;

const CURRENT_AFFAIRS_PROMPT = `You are a current affairs and general knowledge tutor for competitive exam preparation in India (UPSC, SSC, Banking, State PSC) and general academic awareness.

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
**Answer:** [With explanation]`;

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

  async sendMessage(userId: string, chatId: string, userMessage: string) {
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

    // Build conversation context
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
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
  async quickQuery(userId: string, prompt: string, context?: string) {
    if (!prompt.trim()) {
      throw new BadRequestError('Prompt cannot be empty');
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
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
      { role: 'system', content: QUESTION_GENERATION_PROMPT },
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
  }) {
    const { word, language, translateTo } = params;

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
      { role: 'system', content: DICTIONARY_PROMPT },
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
  }) {
    const { topic, category, examType, count, language } = params;
    const numItems = Math.min(count || 10, 20);

    let prompt = `Generate ${numItems} current affairs and general knowledge questions with detailed answers.`;
    if (topic) prompt += `\nFocus on: ${topic}`;
    if (category) prompt += `\nCategory: ${category}`;
    if (examType) prompt += `\nTargeted for: ${examType} exam preparation`;
    if (language && language !== 'en') prompt += `\nRespond in: ${language} (keep proper nouns in English)`;

    const messages: ChatMessage[] = [
      { role: 'system', content: CURRENT_AFFAIRS_PROMPT },
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
  }) {
    const { subject, topic, grade, board, depth, language } = params;

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
      { role: 'system', content: SYSTEM_PROMPT },
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
