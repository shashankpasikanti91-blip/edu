// ──────────────────────────────────────────────────────────────
// Response Formatter — Structures AI output by domain & mode
// ──────────────────────────────────────────────────────────────

import { BoundaryContext } from './userIntent.resolver';

export interface FormattedResponse {
  content: string;
  module: string;
  domain: string;
  standard: string;
  difficulty: string;
  outputMode: string;
  safetyNotices: string[];
  generatedAt: string;
}

/**
 * Wraps raw AI content with module metadata and safety notices.
 */
export function formatResponse(
  rawContent: string,
  ctx: BoundaryContext,
  module: string,
  extras?: Record<string, unknown>
): FormattedResponse {
  const safetyNotices: string[] = [];

  // Medical safety notices — always shown, prominent
  if (ctx.domain === 'medical' || module === 'medical_learning') {
    safetyNotices.push(
      '⚠️ MEDICAL DISCLAIMER: This content is strictly for educational and study purposes only. It does NOT replace professional medical advice, diagnosis, or treatment.',
      'Do NOT use this information for self-medication, self-diagnosis, or treating any patient. Always consult a qualified healthcare provider.',
      'Drug dosages and formulations are for educational reference only. Verify with current pharmacopoeia and your institution\'s protocols before any clinical application.',
      'For medical emergencies, contact your nearest healthcare facility or call emergency services immediately.'
    );
  }

  // Industry safety notices
  if (ctx.domain === 'engineering' || module === 'industry_learning') {
    safetyNotices.push(
      'Safety-critical procedures must be verified with your organisation\'s official SOPs before implementation.'
    );
  }

  // Engineering education notices
  if (module === 'engineering_learning') {
    safetyNotices.push(
      'This content is for educational purposes. Lab experiments and projects must be supervised by faculty.'
    );
  }

  // Commerce/CA notices
  if (module === 'commerce_learning' || ctx.domain === 'finance') {
    safetyNotices.push(
      'Tax computations and legal references are for educational purposes only. Verify with current law before actual filing or compliance.'
    );
  }

  return {
    content: rawContent,
    module,
    domain: ctx.domain,
    standard: ctx.standard,
    difficulty: ctx.difficulty,
    outputMode: ctx.outputMode,
    safetyNotices,
    generatedAt: new Date().toISOString(),
    ...extras,
  };
}

/**
 * Validates that AI-generated content does not contain unsafe medical claims.
 */
export function validateMedicalContent(content: string): string[] {
  const warnings: string[] = [];

  const diagnosisPatterns = [
    /you\s+(have|are\s+suffering\s+from|are\s+diagnosed\s+with)/i,
    /your\s+diagnosis\s+is/i,
    /i\s+diagnose\s+you/i,
    /this\s+confirms?\s+(you\s+have|the\s+diagnosis)/i,
    /based\s+on\s+your\s+symptoms,?\s+you\s+(have|likely\s+have)/i,
  ];

  const treatmentPatterns = [
    /take\s+this\s+(medicine|medication|drug|dose)\s+immediately/i,
    /you\s+must\s+take\s+\d+\s*mg/i,
    /i\s+prescribe\s+you/i,
    /stop\s+taking\s+your\s+(current\s+)?medication/i,
    /buy\s+this\s+(drug|medicine|tablet|capsule)/i,
    /self[- ]medicate/i,
    /take\s+\d+\s*(mg|ml|tablet|capsule)\s+(daily|twice|thrice|every)/i,
  ];

  const emergencyPatterns = [
    /instead\s+of\s+(going\s+to|visiting)\s+(the\s+)?(hospital|emergency|ER|doctor)/i,
    /you\s+don'?t\s+need\s+(a\s+doctor|to\s+go\s+to)/i,
    /no\s+need\s+for\s+(medical|professional)\s+(help|attention)/i,
    /skip\s+(the\s+)?(hospital|doctor|emergency)/i,
    /avoid\s+(going\s+to\s+)?(the\s+)?(hospital|doctor)/i,
  ];

  for (const p of diagnosisPatterns) {
    if (p.test(content)) warnings.push('Content may contain diagnosis-like claims. Review flagged.');
  }
  for (const p of treatmentPatterns) {
    if (p.test(content)) warnings.push('Content may contain prescription-like statements. Review flagged.');
  }
  for (const p of emergencyPatterns) {
    if (p.test(content)) warnings.push('Content may discourage seeking professional medical help. Review flagged.');
  }

  return warnings;
}

/**
 * Checks for copied article patterns (newspaper-style language).
 */
export function validateOriginalContent(content: string): string[] {
  const warnings: string[] = [];

  const copiedPatterns = [
    /\(PTI\)/i,
    /\(ANI\)/i,
    /\(IANS\)/i,
    /our\s+correspondent\s+reports/i,
    /\bstaff\s+reporter\b/i,
    /\breprinted\s+with\s+permission\b/i,
    /copyright\s+©/i,
    /all\s+rights\s+reserved/i,
  ];

  for (const p of copiedPatterns) {
    if (p.test(content)) {
      warnings.push('Content may contain copied news agency attribution. Ensure original wording.');
      break;
    }
  }

  return warnings;
}
