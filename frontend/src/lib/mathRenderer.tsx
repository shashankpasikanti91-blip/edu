'use client';

import React from 'react';
import katex from 'katex';

/**
 * Renders a LaTeX string to HTML using KaTeX.
 * Returns raw HTML string for use with dangerouslySetInnerHTML.
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
 *  - LaTeX commands without delimiters: \frac{}{}, \sin, \cos, etc.
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
      // No more math — check for bare LaTeX commands like \frac, \sin, etc.
      const bareLatex = remaining.match(/\\(frac|sqrt|sum|prod|int|lim|infty|alpha|beta|gamma|delta|theta|pi|sigma|omega|lambda|mu|epsilon|phi|psi|chi|eta|rho|tau|nu|xi|zeta|sin|cos|tan|cot|sec|cosec|csc|log|ln|exp|deg|min|max|sup|inf|det|gcd|binom|choose|vec|hat|bar|dot|ddot|tilde|overline|underline|overbrace|underbrace|pm|mp|times|div|cdot|leq|geq|neq|approx|equiv|subset|supset|cup|cap|in|notin|forall|exists|nabla|partial|left|right|Big|bigg|Bigg|begin|end)\b(\{[\s\S]*?\}(\{[\s\S]*?\})?)?/);

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
