import { BadRequestError } from '../../shared/errors';

export type DateRange = 'last_7_days' | 'last_30_days' | 'this_month' | 'custom';

export interface FreshnessConfig {
  dateRange: DateRange;
  startDate: Date;
  endDate: Date;
  label: string;
}

export function resolveDateRange(
  dateRange?: string,
  customStart?: string,
  customEnd?: string
): FreshnessConfig {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  switch (dateRange) {
    case 'last_7_days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return { dateRange: 'last_7_days', startDate: start, endDate: today, label: 'Last 7 days' };
    }

    case 'this_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      return { dateRange: 'this_month', startDate: start, endDate: today, label: 'This month' };
    }

    case 'custom': {
      if (!customStart || !customEnd) {
        throw new BadRequestError('Custom date range requires both start and end dates.');
      }
      const start = new Date(customStart);
      const end = new Date(customEnd);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestError('Invalid date format. Use ISO 8601 format (YYYY-MM-DD).');
      }
      if (start > end) {
        throw new BadRequestError('Start date must be before end date.');
      }
      // Cap to max 1 year range
      const maxRange = 365 * 24 * 60 * 60 * 1000;
      if (end.getTime() - start.getTime() > maxRange) {
        throw new BadRequestError('Date range cannot exceed 1 year.');
      }
      return { dateRange: 'custom', startDate: start, endDate: end, label: `${customStart} to ${customEnd}` };
    }

    case 'last_30_days':
    default: {
      // Default: last 30 days
      const start = new Date(today);
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      return { dateRange: 'last_30_days', startDate: start, endDate: today, label: 'Last 30 days' };
    }
  }
}

export function buildFreshnessPromptSection(config: FreshnessConfig): string {
  const startStr = config.startDate.toISOString().split('T')[0];
  const endStr = config.endDate.toISOString().split('T')[0];

  return `
FRESHNESS REQUIREMENTS:
- Only include current affairs events from: ${startStr} to ${endStr} (${config.label})
- Every current affairs item MUST include the event date or approximate date
- Every item MUST include a source date or when it was reported
- Do NOT include events from outside this date range unless explicitly labelled as "Background" or "Historical Context"
- If you cannot find verified recent events for a topic, clearly state: "No verified recent events found for this topic in the specified date range."
- Do NOT fabricate or hallucinate current events. Only include events you have reliable knowledge about.
- Do NOT present old events as recent. If an event you mention is older than the specified range, label it clearly as "Historical Reference" or "Background".
- Current date for reference: ${new Date().toISOString().split('T')[0]}`;
}

export function validateFreshnessResponse(content: string, config: FreshnessConfig): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Check for potentially stale year references
  const currentYear = new Date().getFullYear();
  const yearPattern = /\b(20\d{2})\b/g;
  let match;
  const yearsFound = new Set<number>();

  while ((match = yearPattern.exec(content)) !== null) {
    yearsFound.add(parseInt(match[1], 10));
  }

  // Warn if most years referenced are old
  const oldYears = Array.from(yearsFound).filter(y => y < currentYear - 1);
  if (oldYears.length > 0 && yearsFound.size > 0) {
    const oldRatio = oldYears.length / yearsFound.size;
    if (oldRatio > 0.7) {
      warnings.push(`Content references predominantly old years (${oldYears.join(', ')}). This may indicate stale content.`);
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}
