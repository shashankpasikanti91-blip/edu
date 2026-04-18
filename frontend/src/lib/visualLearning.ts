'use client';

/**
 * Visual learning helpers for AI-generated content.
 * Detects tables, key points, and comparisons in markdown-like AI output
 * and applies structured CSS classes for better readability.
 */

/** Wraps AI content sections with visual markers */
export function getAnswerFormatClass(mode: string): string {
  switch (mode) {
    case 'table':
      return 'ai-format-table';
    case 'memory':
      return 'ai-format-memory';
    case 'exam':
      return 'ai-format-exam';
    case 'diagram':
      return 'ai-format-diagram';
    default:
      return '';
  }
}

/** CSS classes injected via globals.css for visual learning modes */
export const visualLearningStyles = `
/* AI Answer Format: Table Compare */
.ai-format-table table {
  @apply w-full border-collapse my-4 text-sm;
}
.ai-format-table th {
  @apply bg-brand-50 text-brand-700 font-semibold px-3 py-2 text-left border border-brand-100;
}
.ai-format-table td {
  @apply px-3 py-2 border border-gray-100;
}
.ai-format-table tr:nth-child(even) td {
  @apply bg-gray-50/50;
}

/* AI Answer Format: Memory Tricks */
.ai-format-memory strong,
.ai-format-memory b {
  @apply text-violet-700 bg-violet-50 px-1 rounded;
}
.ai-format-memory li::marker {
  @apply text-violet-500;
}

/* AI Answer Format: Exam Answer */
.ai-format-exam h3, .ai-format-exam h4 {
  @apply text-emerald-700 border-b border-emerald-100 pb-1 mb-2;
}
.ai-format-exam blockquote {
  @apply border-l-4 border-emerald-300 bg-emerald-50/50 pl-4 py-2 my-3 italic;
}

/* AI Answer Format: Diagram/Summary */
.ai-format-diagram li {
  @apply relative pl-4;
}
.ai-format-diagram li::before {
  content: '→';
  @apply absolute left-0 text-amber-500 font-bold;
}
.ai-format-diagram ol li::before {
  content: none;
}
`;
