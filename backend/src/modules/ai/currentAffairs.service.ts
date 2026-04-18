import { env } from '../../config/env';
import { logger } from '../../shared/utils/logger';
import { BadRequestError } from '../../shared/errors';
import { buildCurrentAffairsPrompt, CurrentAffairsOutputFormat } from './promptBuilder';
import { AnswerStandard } from './answerStandard.resolver';
import { resolveDateRange, validateFreshnessResponse } from './freshness.validator';

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

class CurrentAffairsService {
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
      logger.error('OpenRouter API error (CurrentAffairs)', { status: response.status, error: errorText });

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

  async generateCurrentAffairs(userId: string, params: {
    topic?: string;
    category?: string;
    examType?: string;
    outputFormat?: string;
    dateRange?: string;
    customStartDate?: string;
    customEndDate?: string;
    answerStandard?: string;
    count?: number;
    educationLevel?: string;
    grade?: string;
  }) {
    const {
      topic, category, examType, outputFormat, dateRange,
      customStartDate, customEndDate, answerStandard,
      count, educationLevel, grade,
    } = params;

    // Resolve freshness/date range (defaults to last 30 days)
    const freshnessConfig = resolveDateRange(dateRange, customStartDate, customEndDate);

    // Build the prompt with all context
    const systemPrompt = buildCurrentAffairsPrompt({
      category: category || undefined,
      examType: examType || undefined,
      outputFormat: (outputFormat as CurrentAffairsOutputFormat) || 'comprehensive',
      answerStandard: (answerStandard as AnswerStandard) || undefined,
      freshness: freshnessConfig,
      topic: topic || undefined,
      count: count || 10,
      educationLevel,
      grade,
    });

    let userPrompt = `Generate current affairs content.`;
    if (topic) userPrompt += ` Focus on: ${topic}`;
    if (category) userPrompt += ` Category: ${category}`;
    userPrompt += ` Date range: ${freshnessConfig.label} (${freshnessConfig.startDate.toISOString().split('T')[0]} to ${freshnessConfig.endDate.toISOString().split('T')[0]})`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const content = await this.callOpenRouter(messages, undefined, { maxTokens: 4096, temperature: 0.5 });

    // Validate freshness of generated content
    const freshnessResult = validateFreshnessResponse(content, freshnessConfig);
    if (freshnessResult.warnings.length > 0) {
      logger.warn('Current affairs freshness warnings', {
        userId,
        warnings: freshnessResult.warnings,
        dateRange: freshnessConfig.label,
        category,
        topic,
      });
    }

    return {
      content,
      category: category || 'All Categories',
      topic: topic || null,
      examType: examType || 'General',
      outputFormat: outputFormat || 'comprehensive',
      dateRange: freshnessConfig.label,
      freshnessWarnings: freshnessResult.warnings,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const currentAffairsService = new CurrentAffairsService();
