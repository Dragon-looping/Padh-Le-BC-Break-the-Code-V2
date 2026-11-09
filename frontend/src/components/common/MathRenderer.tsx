import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { clsx } from 'clsx';

export interface MathRendererProps {
  text?: string | null;
  className?: string;
  inline?: boolean;
  block?: boolean;
}

export type Token =
  | { type: 'text'; value: string }
  | { type: 'inline-math'; value: string }
  | { type: 'block-math'; value: string };

/**
 * Checks whether a string appears to be pure raw LaTeX without delimiters.
 * E.g.: "P(y=1|\\mathbf{x}) = \\frac{1}{1 + e^{-z}}"
 */
export function isPureLatex(str: string): boolean {
  const trimmed = str.trim();
  if (!trimmed) return false;
  // If it already has delimiters, it's not pure raw TeX
  if (trimmed.includes('$') || trimmed.includes('\\[') || trimmed.includes('\\(')) {
    return false;
  }
  // Check for common TeX macros and symbols
  const latexPatterns = [
    /\\[a-zA-Z]+/,             // e.g. \frac, \sum, \mathbf, \hat
    /[_\^]\{?[a-zA-Z0-9]/,      // e.g. x_i, y^2, x_{train}
    /\\(?:cdot|times|le|ge|ne|in|propto|min|max|dots|quad)/,
  ];
  return latexPatterns.some((pattern) => pattern.test(trimmed));
}

/**
 * Tokenize a mixed text string into text, inline math, and block math segments.
 * Correctly distinguishes:
 * - Escaped dollars: \$ -> literal $
 * - Standalone currency: $100, $20,000, $1.5M -> literal text
 * - Block math: $$ ... $$ and \[ ... \]
 * - Inline math: $ ... $ and \( ... \)
 */
export function tokenizeMathText(input: string): Token[] {
  if (!input) return [];

  const tokens: Token[] = [];
  let i = 0;
  let textBuffer = '';

  const flushText = () => {
    if (textBuffer.length > 0) {
      tokens.push({ type: 'text', value: textBuffer });
      textBuffer = '';
    }
  };

  while (i < input.length) {
    // 1. Escaped dollar: \$ -> literal $
    if (input.startsWith('\\$', i)) {
      textBuffer += '$';
      i += 2;
      continue;
    }

    // 2. Block math: $$ ... $$
    if (input.startsWith('$$', i)) {
      const end = input.indexOf('$$', i + 2);
      if (end !== -1) {
        flushText();
        tokens.push({
          type: 'block-math',
          value: input.slice(i + 2, end),
        });
        i = end + 2;
        continue;
      }
    }

    // 3. Block math: \[ ... \]
    if (input.startsWith('\\[', i)) {
      const end = input.indexOf('\\]', i + 2);
      if (end !== -1) {
        flushText();
        tokens.push({
          type: 'block-math',
          value: input.slice(i + 2, end),
        });
        i = end + 2;
        continue;
      }
    }

    // 4. Inline math: \( ... \)
    if (input.startsWith('\\(', i)) {
      const end = input.indexOf('\\)', i + 2);
      if (end !== -1) {
        flushText();
        tokens.push({
          type: 'inline-math',
          value: input.slice(i + 2, end),
        });
        i = end + 2;
        continue;
      }
    }

    // 5. Standalone currency: $100, $20,000, $1.5M, etc.
    // Must NOT be treated as opening inline math delimiter.
    if (input[i] === '$') {
      const remaining = input.slice(i);
      // Matches currency: $ followed by digits (with commas/decimals), optional suffix,
      // and NOT followed immediately by a closing $ before space/punctuation.
      const currencyMatch = remaining.match(
        /^\$(\d+(?:,\d{3})*(?:\.\d+)?|\d+)(?!\$)(?:\s*(?:k|K|M|B|thousand|million|billion))?(?=[.,!?;:)]?(?:\s|$))/
      );

      if (currencyMatch) {
        textBuffer += currencyMatch[0];
        i += currencyMatch[0].length;
        continue;
      }

      // 6. Inline math: $ ... $
      // Scan forward on the same line for closing unescaped $
      let end = -1;
      for (let k = i + 1; k < input.length; k++) {
        if (input[k] === '\n') {
          break; // inline math does not span across lines
        }
        if (input[k] === '$' && input[k - 1] !== '\\') {
          end = k;
          break;
        }
      }

      if (end !== -1) {
        const mathContent = input.slice(i + 1, end);
        if (mathContent.trim().length > 0) {
          flushText();
          tokens.push({
            type: 'inline-math',
            value: mathContent,
          });
          i = end + 1;
          continue;
        }
      }
    }

    // Regular character
    textBuffer += input[i];
    i++;
  }

  flushText();
  return tokens;
}

/**
 * Safely renders LaTeX to HTML using KaTeX.
 */
function renderKaTeX(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex.trim(), {
      displayMode,
      throwOnError: false,
      errorColor: '#FF5A6E', // Corresponds to --color-coral-500
    });
  } catch (err) {
    console.warn('KaTeX rendering error:', err);
    return tex;
  }
}

/**
 * MathRenderer component.
 * Renders mixed text with inline and block mathematical formulas seamlessly.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  text,
  className,
  inline = false,
  block = false,
}) => {
  if (!text) return null;

  // Case 1: Pure raw TeX formula without delimiters (e.g. "P(y=1|\mathbf{x}) = \frac{1}{1 + e^{-z}}")
  // Only use raw block rendering if the string does NOT contain mixed delimiters.
  const hasDelimiters =
    text.includes('$') || text.includes('\\[') || text.includes('\\(');

  if (!hasDelimiters && (block || isPureLatex(text))) {
    const html = renderKaTeX(text, true);
    return (
      <div
        className={clsx(
          'my-4 p-4 overflow-x-auto text-center font-mono text-bone-100 bg-graphite-800/20 border border-graphite-700/50 rounded-sm',
          className
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // Case 2: Mixed text or delimited formulas
  const tokens = useMemo(() => tokenizeMathText(text), [text]);

  const content = tokens.map((token, index) => {
    if (token.type === 'text') {
      return <React.Fragment key={index}>{token.value}</React.Fragment>;
    }

    if (token.type === 'block-math') {
      const html = renderKaTeX(token.value, true);
      return (
        <div
          key={index}
          className="my-4 p-4 overflow-x-auto text-center font-mono text-bone-100 bg-graphite-800/20 border border-graphite-700/50 rounded-sm"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    // Inline math
    const html = renderKaTeX(token.value, false);
    return (
      <span
        key={index}
        className="inline-math mx-0.5 align-baseline font-mono text-cyan-300"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  });

  if (inline) {
    return <span className={className}>{content}</span>;
  }

  return <div className={className}>{content}</div>;
};

export default MathRenderer;
