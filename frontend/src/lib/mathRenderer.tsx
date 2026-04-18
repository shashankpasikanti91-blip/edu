'use client';

import React from 'react';
import katex from 'katex';

/**
 * Renders a LaTeX string to HTML using KaTeX.
 */
function renderLatex(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: true,
      macros: {
        '\\R': '\\mathbb{R}',
        '\\N': '\\mathbb{N}',
        '\\Z': '\\mathbb{Z}',
      },
    });
  } catch {
    return latex;
  }
}

/**
 * Processes text containing LaTeX math expressions and returns React nodes.
 * Supports:
 *  - Display math: $$...$$
 *  - Inline math: $...$
 *  - LaTeX commands without delimiters: \frac{}{}, \boxed{}, \sin, etc.
 */
export function processLatex(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Look for display math $$...$$ first
    const displayMatch = remaining.match(/\$\$([\s\S]*?)\$\$/);
    // Look for inline math $...$  (not $$)
    const inlineMatch = remaining.match(/(?<!\$)\$(?!\$)((?:[^$\\]|\\.)+?)\$(?!\$)/);

    // Find which comes first
    type LatexMatch = { index: number; fullLength: number; latex: string; display: boolean };
    const candidates: LatexMatch[] = [];

    if (displayMatch && displayMatch.index !== undefined) {
      candidates.push({
        index: displayMatch.index,
        fullLength: displayMatch[0].length,
        latex: displayMatch[1].trim(),
        display: true,
      });
    }

    if (inlineMatch && inlineMatch.index !== undefined) {
      candidates.push({
        index: inlineMatch.index,
        fullLength: inlineMatch[0].length,
        latex: inlineMatch[1].trim(),
        display: false,
      });
    }

    const firstMatch = candidates.length > 0
      ? candidates.reduce((a, b) => (a.index <= b.index ? a : b))
      : null;

    if (firstMatch) {
      // Add text before the match
      if (firstMatch.index > 0) {
        nodes.push(remaining.slice(0, firstMatch.index));
      }

      // Render the LaTeX
      const html = renderLatex(firstMatch.latex, firstMatch.display);
      if (firstMatch.display) {
        nodes.push(
          <div
            key={`math-${key++}`}
            className="math-display my-3 overflow-x-auto text-center"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } else {
        nodes.push(
          <span
            key={`math-${key++}`}
            className="math-inline"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }

      remaining = remaining.slice(firstMatch.index + firstMatch.fullLength);
    } else {
      // No more $-delimited math — check for bare LaTeX commands
      const bareLatex = remaining.match(/\\(boxed|frac|dfrac|tfrac|cfrac|sqrt|sum|prod|int|iint|iiint|oint|lim|infty|alpha|beta|gamma|delta|theta|pi|sigma|omega|lambda|mu|epsilon|varepsilon|phi|varphi|psi|chi|eta|rho|tau|nu|xi|zeta|kappa|iota|Delta|Gamma|Theta|Lambda|Sigma|Omega|Pi|Phi|Psi|sin|cos|tan|cot|sec|cosec|csc|log|ln|exp|deg|min|max|sup|inf|det|gcd|binom|choose|vec|hat|bar|dot|ddot|tilde|overline|underline|overbrace|underbrace|widehat|widetilde|pm|mp|times|div|cdot|cdots|ldots|vdots|ddots|leq|geq|neq|approx|equiv|cong|sim|simeq|propto|subset|supset|subseteq|supseteq|cup|cap|in|notin|forall|exists|nexists|nabla|partial|left|right|Big|bigg|Bigg|begin|end|text|textbf|textit|textrm|mathrm|mathbf|mathit|mathcal|mathbb|mathfrak|displaystyle|scriptstyle|limits|nolimits|operatorname|color|cancel|bcancel|xcancel|not|to|rightarrow|leftarrow|Rightarrow|Leftarrow|leftrightarrow|Leftrightarrow|uparrow|downarrow|mapsto|implies|iff|neg|land|lor|oplus|otimes|perp|angle|triangle|square|circ|bullet|star|dagger|hbar|ell|wp|Re|Im)\b(\{[\s\S]*?\}(\{[\s\S]*?\})?)?/);

      if (bareLatex && bareLatex.index !== undefined) {
        // Add text before
        if (bareLatex.index > 0) {
          nodes.push(remaining.slice(0, bareLatex.index));
        }

        // Try to capture more complete LaTeX expression
        let latexExpr = bareLatex[0];
        const afterMatch = remaining.slice(bareLatex.index + latexExpr.length);

        // If it's a command that usually has arguments, try to grab more
        const extendMatch = afterMatch.match(/^(\{[\s\S]*?\})+/);
        if (extendMatch) {
          latexExpr += extendMatch[0];
        }

        const html = renderLatex(latexExpr, false);
        nodes.push(
          <span
            key={`math-${key++}`}
            className="math-inline"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
        remaining = remaining.slice(bareLatex.index + latexExpr.length);
      } else {
        nodes.push(remaining);
        break;
      }
    }
  }

  return nodes;
}

/**
 * React component that renders text with LaTeX math support.
 */
export function MathText({ text, className }: { text: string; className?: string }) {
  const nodes = processLatex(text);
  return <span className={className}>{nodes}</span>;
}

// ─── Shared Inline Formatter ────────────────────────────────

function formatInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    const codeMatch = remaining.match(/`([^`]+)`/);
    const mathMatch = remaining.match(/(?<!\$)\$(?!\$)((?:[^$\\]|\\.)+?)\$(?!\$)/);
    const displayMathMatch = remaining.match(/\$\$([\s\S]*?)\$\$/);

    type InlineMatch = { index: number; length: number; node: React.ReactNode };
    const candidates: InlineMatch[] = [];

    if (boldMatch && boldMatch.index !== undefined) {
      candidates.push({
        index: boldMatch.index,
        length: boldMatch[0].length,
        node: <strong key={`b-${key++}`} className="font-semibold text-gray-900">{boldMatch[1]}</strong>,
      });
    }

    if (codeMatch && codeMatch.index !== undefined) {
      candidates.push({
        index: codeMatch.index,
        length: codeMatch[0].length,
        node: <code key={`c-${key++}`} className="bg-gray-100 text-rose-600 px-1.5 py-0.5 rounded text-sm font-mono">{codeMatch[1]}</code>,
      });
    }

    if (displayMathMatch && displayMathMatch.index !== undefined) {
      const mathNodes = processLatex(displayMathMatch[0]);
      candidates.push({
        index: displayMathMatch.index,
        length: displayMathMatch[0].length,
        node: <span key={`dm-${key++}`}>{mathNodes}</span>,
      });
    } else if (mathMatch && mathMatch.index !== undefined) {
      const mathNodes = processLatex(mathMatch[0]);
      candidates.push({
        index: mathMatch.index,
        length: mathMatch[0].length,
        node: <span key={`m-${key++}`}>{mathNodes}</span>,
      });
    }

    const firstMatch = candidates.length > 0
      ? candidates.reduce((a, b) => a.index <= b.index ? a : b)
      : null;

    if (firstMatch) {
      if (firstMatch.index > 0) {
        const before = remaining.slice(0, firstMatch.index);
        const processed = processLatex(before);
        parts.push(<span key={`t-${key++}`}>{processed}</span>);
      }
      parts.push(firstMatch.node);
      remaining = remaining.slice(firstMatch.index + firstMatch.length);
    } else {
      const processed = processLatex(remaining);
      parts.push(<span key={`t-${key++}`}>{processed}</span>);
      break;
    }
  }

  return <>{parts}</>;
}

// ─── Shared Markdown Renderer ───────────────────────────────

/**
 * Renders markdown text (from AI responses) into styled React nodes.
 * Handles headings, lists, code blocks, bold, inline code, and LaTeX math.
 * Used by ai-assistant, exam-prep, current-affairs, and dictionary pages.
 */
export function renderMarkdownContent(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent: string[] = [];
  let codeLanguage = '';

  lines.forEach((line, i) => {
    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="bg-gray-900 text-green-300 rounded-lg p-4 my-2 text-sm overflow-x-auto font-mono">
            <code>{codeContent.join('\n')}</code>
          </pre>
        );
        codeContent = [];
        codeLanguage = '';
        inCodeBlock = false;
      } else {
        codeLanguage = line.slice(3).trim();
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      return;
    }

    // Headings
    if (line.startsWith('#### ')) {
      elements.push(<h4 key={i} className="text-sm font-semibold text-gray-700 mt-2 mb-1">{formatInline(line.slice(5))}</h4>);
      return;
    }
    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-base font-semibold text-gray-800 mt-3 mb-1">{formatInline(line.slice(4))}</h3>);
      return;
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-lg font-bold text-gray-900 mt-4 mb-2">{formatInline(line.slice(3))}</h2>);
      return;
    }
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-xl font-bold text-gray-900 mt-4 mb-2">{formatInline(line.slice(2))}</h1>);
      return;
    }

    // Horizontal rule
    if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) {
      elements.push(<hr key={i} className="my-3 border-gray-200" />);
      return;
    }

    // Table rows (basic markdown table support)
    if (line.startsWith('|') && line.endsWith('|')) {
      // Skip separator rows like |---|---|
      if (line.match(/^\|[\s-:|]+\|$/)) return;

      const cells = line.split('|').filter(c => c.trim() !== '');
      const isHeader = i + 1 < lines.length && lines[i + 1]?.match(/^\|[\s-:|]+\|$/);
      const Tag = isHeader ? 'th' : 'td';
      elements.push(
        <div key={i} className="overflow-x-auto">
          <table className="min-w-full border-collapse my-1">
            <tr className={isHeader ? 'bg-gray-100' : ''}>
              {cells.map((cell, ci) => (
                <Tag key={ci} className="border border-gray-300 px-3 py-1.5 text-sm text-gray-700">
                  {formatInline(cell.trim())}
                </Tag>
              ))}
            </tr>
          </table>
        </div>
      );
      return;
    }

    // Bullet list
    if (line.match(/^[\s]*[-*]\s/)) {
      const indent = line.match(/^(\s*)/)?.[1]?.length || 0;
      const content = line.replace(/^[\s]*[-*]\s/, '');
      elements.push(
        <div key={i} className="flex gap-2 my-0.5" style={{ paddingLeft: `${Math.min(indent, 8) * 4}px` }}>
          <span className="text-brand-500 mt-1 flex-shrink-0">•</span>
          <span className="text-gray-700">{formatInline(content)}</span>
        </div>
      );
      return;
    }

    // Numbered list
    if (line.match(/^\s*\d+\.\s/)) {
      const match = line.match(/^(\s*)(\d+)\.\s(.*)/);
      if (match) {
        const indent = match[1].length;
        elements.push(
          <div key={i} className="flex gap-2 my-0.5" style={{ paddingLeft: `${Math.min(indent, 8) * 4}px` }}>
            <span className="text-brand-600 font-medium flex-shrink-0">{match[2]}.</span>
            <span className="text-gray-700">{formatInline(match[3])}</span>
          </div>
        );
        return;
      }
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-brand-300 pl-4 my-2 text-gray-600 italic">
          {formatInline(line.slice(2))}
        </blockquote>
      );
      return;
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
      return;
    }

    // Regular paragraph
    elements.push(<p key={i} className="text-gray-700 my-0.5">{formatInline(line)}</p>);
  });

  return <div className="space-y-0.5">{elements}</div>;
}
