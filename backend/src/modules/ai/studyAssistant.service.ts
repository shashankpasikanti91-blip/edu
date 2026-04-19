import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { logger } from '../../shared/utils/logger';
import { BadRequestError, NotFoundError } from '../../shared/errors';
import { buildStudyAssistantPrompt, StudyMode } from './promptBuilder';
import { AnswerStandard } from './answerStandard.resolver';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

// Content safety patterns
const BLOCKED_PATTERNS = [
  /\b(porn|sex\s*chat|nude|naked|xxx|hentai|erotic)\b/i,
  /\b(kill\s+(yourself|myself|someone)|suicide\s+method|how\s+to\s+die)\b/i,
  /\b(make\s+a?\s*(bomb|weapon|drug|meth|explosive))\b/i,
  /\b(hack\s+(into|someone|account|password))\b/i,
  /\b(buy\s+(drugs|narcotics|cocaine|heroin|mdma)\s+online)\b/i,
  /\b(how\s+to\s+(steal|cheat\s+in\s+exam|forge|counterfeit))\b/i,
  /\b(illegal\s+download|pirate|crack\s+software)\b/i,
  /\b(child\s+(abuse|exploitation))\b/i,
  /\b(self[- ]?harm|cut\s+(yourself|myself)|anorexia\s+tips)\b/i,
];

class StudyAssistantService {
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
      logger.error('OpenRouter API error (StudyAssistant)', { status: response.status, error: errorText });

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

  private validateContent(message: string): void {
    if (BLOCKED_PATTERNS.some(p => p.test(message))) {
      throw new BadRequestError('Your message contains content that is not appropriate for an educational platform. Please keep your queries related to your studies.');
    }
  }

  async createChat(userId: string, title?: string) {
    return prisma.aiChat.create({
      data: { userId, title: title || 'New Chat' },
    });
  }

  async sendMessage(userId: string, chatId: string, params: {
    message: string;
    mode?: StudyMode;
    answerStandard?: AnswerStandard;
    educationLevel?: string;
    grade?: string;
  }) {
    const { message, mode, answerStandard, educationLevel, grade } = params;

    if (!message.trim()) {
      throw new BadRequestError('Message cannot be empty');
    }
    this.validateContent(message);

    const chat = await prisma.aiChat.findFirst({
      where: { id: chatId, userId },
      include: {
        messages: { orderBy: { createdAt: 'asc' }, take: 20 },
      },
    });

    if (!chat) {
      throw new NotFoundError('Chat not found');
    }

    // Save user message
    await prisma.aiChatMessage.create({
      data: { chatId, role: 'user', content: message },
    });

    // Build system prompt with Indian-standard defaults
    const systemPrompt = buildStudyAssistantPrompt({
      mode: mode || 'default',
      answerStandard: answerStandard || 'indian',
      educationLevel,
      grade,
    });

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...chat.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    const aiResponse = await this.callOpenRouter(messages, undefined, { maxTokens: 4096 });

    const savedMessage = await prisma.aiChatMessage.create({
      data: { chatId, role: 'assistant', content: aiResponse },
    });

    // Auto-generate title for new chats
    if (chat.title === 'New Chat' && chat.messages.length === 0) {
      try {
        const titleMessages: ChatMessage[] = [
          { role: 'system', content: 'Generate a short title (max 6 words) for this conversation based on the educational topic. Return only the title, nothing else.' },
          { role: 'user', content: message },
        ];
        const generatedTitle = await this.callOpenRouter(titleMessages, undefined, { maxTokens: 50, temperature: 0.5 });
        await prisma.aiChat.update({
          where: { id: chatId },
          data: { title: generatedTitle.replace(/^["']|["']$/g, '').slice(0, 100) },
        });
      } catch (err) {
        logger.warn('Failed to generate chat title', { chatId, error: err instanceof Error ? err.message : String(err) });
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
        include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
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
    const chat = await prisma.aiChat.findFirst({ where: { id: chatId, userId } });
    if (!chat) throw new NotFoundError('Chat not found');

    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      prisma.aiChatMessage.findMany({ where: { chatId }, orderBy: { createdAt: 'asc' }, skip, take: limit }),
      prisma.aiChatMessage.count({ where: { chatId } }),
    ]);

    return { messages, total, page, totalPages: Math.ceil(total / limit) };
  }

  async deleteChat(userId: string, chatId: string) {
    const chat = await prisma.aiChat.findFirst({ where: { id: chatId, userId } });
    if (!chat) throw new NotFoundError('Chat not found');
    await prisma.aiChat.delete({ where: { id: chatId } });
  }

  async quickQuery(userId: string, params: {
    prompt: string;
    context?: string;
    mode?: StudyMode;
    answerStandard?: AnswerStandard;
    educationLevel?: string;
    grade?: string;
    subject?: string;
    board?: string;
  }) {
    const { prompt, context, mode, answerStandard, educationLevel, grade, subject, board } = params;

    if (!prompt.trim()) {
      throw new BadRequestError('Prompt cannot be empty');
    }
    this.validateContent(prompt);

    const systemPrompt = buildStudyAssistantPrompt({
      mode: mode || 'default',
      answerStandard: answerStandard || 'indian',
      educationLevel,
      grade,
      subject,
      board,
    });

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
}

export const studyAssistantService = new StudyAssistantService();
