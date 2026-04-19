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
        '\\Q': '\\mathbb{Q}',
        '\\C': '\\mathbb{C}',
      },
    });
  } catch {
    // If KaTeX fails, try without display mode as fallback
    try {
      return katex.renderToString(latex, {
        displayMode: false,
        throwOnError: false,
        strict: false,
        trust: true,
      });
    } catch {
      return `<code class="math-error">${latex}</code>`;
    }
  }
}

/**
 * Normalizes common AI-model LaTeX quirks before rendering.
 * Fixes double-escaped backslashes, missing braces, etc.
 */
function normalizeLatex(raw: string): string {
  let s = raw;
  // Fix double-escaped backslashes (\\\\frac → \\frac)
  s = s.replace(/\\\\(?=[a-zA-Z])/g, '\\');
  // Fix \\[ and \\] used as display delimiters inside $$ blocks
  s = s.replace(/^\\\[/, '').replace(/\\\]$/, '');
  // Fix \\( and \\) used as inline delimiters inside $ blocks
  s = s.replace(/^\\\(/, '').replace(/\\\)$/, '');
  // Trim whitespace
  return s.trim();
}

/**
 * Processes text containing LaTeX math expressions and returns React nodes.
 * Supports:
 *  - Display math: $$...$$, \[...\]
 *  - Inline math: $...$, \(...\)
 *  - LaTeX environments: \begin{array}...\end{array}, \begin{align}...\end{align}, etc.
 *  - LaTeX commands without delimiters: \frac{}{}, \boxed{}, \sin, etc.
 */
export function processLatex(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Look for all math delimiters and find the earliest one
    type LatexMatch = { index: number; fullLength: number; latex: string; display: boolean };
    const candidates: LatexMatch[] = [];

    // 1. Display math $$...$$
    const displayMatch = remaining.match(/\$\$([\s\S]*?)\$\$/);
    if (displayMatch && displayMatch.index !== undefined) {
      candidates.push({
        index: displayMatch.index,
        fullLength: displayMatch[0].length,
        latex: normalizeLatex(displayMatch[1]),
        display: true,
      });
    }

    // 2. Display math \[...\] (bracket delimiters)
    const bracketDisplayMatch = remaining.match(/\\\[([\s\S]*?)\\\]/);
    if (bracketDisplayMatch && bracketDisplayMatch.index !== undefined) {
      candidates.push({
        index: bracketDisplayMatch.index,
        fullLength: bracketDisplayMatch[0].length,
        latex: normalizeLatex(bracketDisplayMatch[1]),
        display: true,
      });
    }

    // 3. Inline math $...$ (not $$)
    const inlineMatch = remaining.match(/(?<!\$)\$(?!\$)((?:[^$\\]|\\.)+?)\$(?!\$)/);
    if (inlineMatch && inlineMatch.index !== undefined) {
      candidates.push({
        index: inlineMatch.index,
        fullLength: inlineMatch[0].length,
        latex: normalizeLatex(inlineMatch[1]),
        display: false,
      });
    }

    // 4. Inline math \(...\) (paren delimiters)
    const parenInlineMatch = remaining.match(/\\\(([\s\S]*?)\\\)/);
    if (parenInlineMatch && parenInlineMatch.index !== undefined) {
      candidates.push({
        index: parenInlineMatch.index,
        fullLength: parenInlineMatch[0].length,
        latex: normalizeLatex(parenInlineMatch[1]),
        display: false,
      });
    }

    // 5. Bare \begin{env}...\end{env} blocks (NOT wrapped in $ or $$)
    const envMatch = remaining.match(/\\begin\{(array|align|align\*|aligned|alignat|gather|gather\*|gathered|equation|equation\*|eqnarray|eqnarray\*|matrix|pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|smallmatrix|cases|split|multline|multline\*|flalign|flalign\*|subequations)\}([\s\S]*?)\\end\{\1\}/);
    if (envMatch && envMatch.index !== undefined) {
      // Only add if not already inside a $$ block (check if preceded by $)
      const charBefore = envMatch.index > 0 ? remaining[envMatch.index - 1] : '';
      if (charBefore !== '$') {
        candidates.push({
          index: envMatch.index,
          fullLength: envMatch[0].length,
          latex: envMatch[0],
          display: true,
        });
      }
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
      // No more delimited math — check for bare LaTeX commands
      const bareLatex = remaining.match(/\\(boxed|frac|dfrac|tfrac|cfrac|sqrt|sum|prod|int|iint|iiint|oint|lim|infty|alpha|beta|gamma|delta|theta|pi|sigma|omega|lambda|mu|epsilon|varepsilon|phi|varphi|psi|chi|eta|rho|tau|nu|xi|zeta|kappa|iota|Delta|Gamma|Theta|Lambda|Sigma|Omega|Pi|Phi|Psi|sin|cos|tan|cot|sec|cosec|csc|log|ln|exp|deg|min|max|sup|inf|det|gcd|binom|choose|vec|hat|bar|dot|ddot|tilde|overline|underline|overbrace|underbrace|widehat|widetilde|pm|mp|times|div|cdot|cdots|ldots|vdots|ddots|leq|geq|neq|approx|equiv|cong|sim|simeq|propto|subset|supset|subseteq|supseteq|cup|cap|in|notin|forall|exists|nexists|nabla|partial|left|right|Big|bigg|Bigg|text|textbf|textit|textrm|mathrm|mathbf|mathit|mathcal|mathbb|mathfrak|displaystyle|scriptstyle|limits|nolimits|operatorname|color|cancel|bcancel|xcancel|not|to|rightarrow|leftarrow|Rightarrow|Leftarrow|leftrightarrow|Leftrightarrow|uparrow|downarrow|mapsto|implies|iff|neg|land|lor|oplus|otimes|perp|angle|triangle|square|circ|bullet|star|dagger|hbar|ell|wp|Re|Im|hline|cline)\b(\{[\s\S]*?\}(\{[\s\S]*?\})?)?/);

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
  // ── Step 1: Extract multi-line display math & code blocks before line splitting ──
  // Split text into segments: plain text vs display-math vs code-block
  type Segment = { kind: 'text'; content: string } | { kind: 'displaymath'; content: string } | { kind: 'code'; content: string; language: string };
  const segments: Segment[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const mathIdx = remaining.indexOf('$$');
    const codeIdx = remaining.indexOf('```');
    // Also detect \[...\] display math and bare \begin{env}
    const bracketMathMatch = remaining.match(/\\\[/);
    const bracketMathIdx = bracketMathMatch?.index ?? -1;
    const bareEnvMatch = remaining.match(/\\begin\{(array|align|align\*|aligned|alignat|gather|gather\*|gathered|equation|equation\*|eqnarray|eqnarray\*|matrix|pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|smallmatrix|cases|split|multline|multline\*|flalign|flalign\*|subequations)\}/);
    const bareEnvIdx = bareEnvMatch?.index ?? -1;

    // Find which delimiter comes first
    const indices: Array<{ type: string; idx: number }> = [];
    if (mathIdx !== -1) indices.push({ type: 'math', idx: mathIdx });
    if (codeIdx !== -1) indices.push({ type: 'code', idx: codeIdx });
    if (bracketMathIdx !== -1) indices.push({ type: 'bracketmath', idx: bracketMathIdx });
    if (bareEnvIdx !== -1) {
      // Only if not already inside a $$ context (no preceding $ on same position)
      const charBefore = bareEnvIdx > 0 ? remaining[bareEnvIdx - 1] : '';
      if (charBefore !== '$') indices.push({ type: 'bareenv', idx: bareEnvIdx });
    }

    if (indices.length === 0) {
      segments.push({ kind: 'text', content: remaining });
      break;
    }

    indices.sort((a, b) => a.idx - b.idx);
    const first = indices[0];

    if (first.type === 'math') {
      // Text before $$
      if (mathIdx > 0) {
        segments.push({ kind: 'text', content: remaining.slice(0, mathIdx) });
      }
      const afterOpen = remaining.slice(mathIdx + 2);
      const closeIdx = afterOpen.indexOf('$$');
      if (closeIdx === -1) {
        segments.push({ kind: 'text', content: remaining.slice(mathIdx) });
        break;
      }
      segments.push({ kind: 'displaymath', content: normalizeLatex(afterOpen.slice(0, closeIdx)) });
      remaining = afterOpen.slice(closeIdx + 2);
    } else if (first.type === 'bracketmath') {
      // \[...\] display math
      if (bracketMathIdx > 0) {
        segments.push({ kind: 'text', content: remaining.slice(0, bracketMathIdx) });
      }
      const afterOpen = remaining.slice(bracketMathIdx + 2);
      const closeIdx = afterOpen.indexOf('\\]');
      if (closeIdx === -1) {
        segments.push({ kind: 'text', content: remaining.slice(bracketMathIdx) });
        break;
      }
      segments.push({ kind: 'displaymath', content: normalizeLatex(afterOpen.slice(0, closeIdx)) });
      remaining = afterOpen.slice(closeIdx + 2);
    } else if (first.type === 'bareenv') {
      // \begin{env}...\end{env} bare environment
      const envName = bareEnvMatch![1];
      const envStartIdx = bareEnvIdx;
      if (envStartIdx > 0) {
        segments.push({ kind: 'text', content: remaining.slice(0, envStartIdx) });
      }
      const envEndTag = `\\end{${envName}}`;
      const afterStart = remaining.slice(envStartIdx);
      const endIdx = afterStart.indexOf(envEndTag);
      if (endIdx === -1) {
        segments.push({ kind: 'text', content: afterStart });
        break;
      }
      const fullEnv = afterStart.slice(0, endIdx + envEndTag.length);
      segments.push({ kind: 'displaymath', content: fullEnv });
      remaining = afterStart.slice(endIdx + envEndTag.length);
    } else {
      // Code block
      if (codeIdx > 0) {
        segments.push({ kind: 'text', content: remaining.slice(0, codeIdx) });
      }
      const afterOpen = remaining.slice(codeIdx + 3);
      const langEnd = afterOpen.indexOf('\n');
      const language = langEnd >= 0 ? afterOpen.slice(0, langEnd).trim() : '';
      const codeStart = langEnd >= 0 ? afterOpen.slice(langEnd + 1) : afterOpen;
      const closeIdx = codeStart.indexOf('```');
      if (closeIdx === -1) {
        segments.push({ kind: 'text', content: remaining.slice(codeIdx) });
        break;
      }
      segments.push({ kind: 'code', content: codeStart.slice(0, closeIdx), language });
      remaining = codeStart.slice(closeIdx + 3);
    }
  }

  // ── Step 2: Render each segment ──
  const elements: React.ReactNode[] = [];
  let key = 0;

  segments.forEach((seg) => {
    if (seg.kind === 'displaymath') {
      const html = renderLatex(seg.content, true);
      elements.push(
        <div
          key={`dmath-${key++}`}
          className="math-display my-3 overflow-x-auto text-center"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
      return;
    }

    if (seg.kind === 'code') {
      elements.push(
        <pre key={`code-${key++}`} className="bg-gray-900 text-green-300 rounded-lg p-4 my-2 text-sm overflow-x-auto font-mono">
          <code>{seg.content}</code>
        </pre>
      );
      return;
    }

    // Process text lines
    const lines = seg.content.split('\n');

    lines.forEach((line) => {
      // Headings
      if (line.startsWith('#### ')) {
        elements.push(<h4 key={key++} className="text-sm font-semibold text-gray-700 mt-2 mb-1">{formatInline(line.slice(5))}</h4>);
        return;
      }
      if (line.startsWith('### ')) {
        elements.push(<h3 key={key++} className="text-base font-semibold text-gray-800 mt-3 mb-1">{formatInline(line.slice(4))}</h3>);
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(<h2 key={key++} className="text-lg font-bold text-gray-900 mt-4 mb-2">{formatInline(line.slice(3))}</h2>);
        return;
      }
      if (line.startsWith('# ')) {
        elements.push(<h1 key={key++} className="text-xl font-bold text-gray-900 mt-4 mb-2">{formatInline(line.slice(2))}</h1>);
        return;
      }

      // Horizontal rule
      if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) {
        elements.push(<hr key={key++} className="my-3 border-gray-200" />);
        return;
      }

      // Table rows (markdown table)
      if (line.startsWith('|') && line.endsWith('|')) {
        if (line.match(/^\|[\s-:|]+\|$/)) return;
        const cells = line.split('|').filter(c => c.trim() !== '');
        elements.push(
          <div key={key++} className="overflow-x-auto">
            <table className="min-w-full border-collapse my-1">
              <tbody>
                <tr>
                  {cells.map((cell, ci) => (
                    <td key={ci} className="border border-gray-300 px-3 py-1.5 text-sm text-gray-700">
                      {formatInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              </tbody>
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
          <div key={key++} className="flex gap-2 my-0.5" style={{ paddingLeft: `${Math.min(indent, 8) * 4}px` }}>
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
            <div key={key++} className="flex gap-2 my-0.5" style={{ paddingLeft: `${Math.min(indent, 8) * 4}px` }}>
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
          <blockquote key={key++} className="border-l-4 border-brand-300 pl-4 my-2 text-gray-600 italic">
            {formatInline(line.slice(2))}
          </blockquote>
        );
        return;
      }

      // Empty line
      if (line.trim() === '') {
        elements.push(<div key={key++} className="h-2" />);
        return;
      }

      // Regular paragraph
      elements.push(<p key={key++} className="text-gray-700 my-0.5">{formatInline(line)}</p>);
    });
  });

  return <div className="space-y-0.5">{elements}</div>;
}
