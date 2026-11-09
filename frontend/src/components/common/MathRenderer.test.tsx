import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import React from 'react';
import { tokenizeMathText, isPureLatex, MathRenderer } from './MathRenderer';

describe('MathRenderer - Tokenizer', () => {
  it('tokenizes plain text with no math', () => {
    const tokens = tokenizeMathText('Hello, machine learning!');
    expect(tokens).toEqual([{ type: 'text', value: 'Hello, machine learning!' }]);
  });

  it('tokenizes inline math with single dollar delimiters', () => {
    const tokens = tokenizeMathText('The equation is $y = mx + c$ and it works.');
    expect(tokens).toEqual([
      { type: 'text', value: 'The equation is ' },
      { type: 'inline-math', value: 'y = mx + c' },
      { type: 'text', value: ' and it works.' },
    ]);
  });

  it('tokenizes multiple inline math expressions', () => {
    const tokens = tokenizeMathText('Slope $m$ and intercept $c$ with $k=5$.');
    expect(tokens).toEqual([
      { type: 'text', value: 'Slope ' },
      { type: 'inline-math', value: 'm' },
      { type: 'text', value: ' and intercept ' },
      { type: 'inline-math', value: 'c' },
      { type: 'text', value: ' with ' },
      { type: 'inline-math', value: 'k=5' },
      { type: 'text', value: '.' },
    ]);
  });

  it('tokenizes block math with double dollar delimiters', () => {
    const tokens = tokenizeMathText('$$J(\\theta) = \\frac{1}{2n} \\sum_{i=1}^n (y_i - \\hat{y}_i)^2$$');
    expect(tokens).toEqual([
      {
        type: 'block-math',
        value: 'J(\\theta) = \\frac{1}{2n} \\sum_{i=1}^n (y_i - \\hat{y}_i)^2',
      },
    ]);
  });

  it('tokenizes block math with brackets \\[ \\]', () => {
    const tokens = tokenizeMathText('\\[ \\mathbf{X}^T \\mathbf{X} \\]');
    expect(tokens).toEqual([
      { type: 'block-math', value: ' \\mathbf{X}^T \\mathbf{X} ' },
    ]);
  });

  it('tokenizes inline math with parens \\( \\)', () => {
    const tokens = tokenizeMathText('Function \\( f(x) = \\sigma(x) \\) maps real numbers.');
    expect(tokens).toEqual([
      { type: 'text', value: 'Function ' },
      { type: 'inline-math', value: ' f(x) = \\sigma(x) ' },
      { type: 'text', value: ' maps real numbers.' },
    ]);
  });

  it('preserves escaped dollar signs as literal currency without breaking math', () => {
    const tokens = tokenizeMathText('Scaling salary (\\$20,000 to \\$200,000) for model $f(x)$.');
    expect(tokens).toEqual([
      { type: 'text', value: 'Scaling salary ($20,000 to $200,000) for model ' },
      { type: 'inline-math', value: 'f(x)' },
      { type: 'text', value: '.' },
    ]);
  });

  it('correctly handles unescaped currency amounts without breaking into math', () => {
    const tokens = tokenizeMathText('House prices from $20,000 to $50,000 with features $x_1, x_2$.');
    expect(tokens).toEqual([
      { type: 'text', value: 'House prices from $20,000 to $50,000 with features ' },
      { type: 'inline-math', value: 'x_1, x_2' },
      { type: 'text', value: '.' },
    ]);
  });

  it('handles solitary or unclosed dollar signs gracefully', () => {
    const tokens = tokenizeMathText('It costs $100 total.');
    expect(tokens).toEqual([{ type: 'text', value: 'It costs $100 total.' }]);
  });
});

describe('MathRenderer - isPureLatex detection', () => {
  it('detects pure LaTeX formulas correctly', () => {
    expect(isPureLatex('P(y=1|\\mathbf{x}) = \\frac{1}{1 + e^{-z}}')).toBe(true);
    expect(isPureLatex('\\min_{\\mathbf{w}} \\frac{1}{2}\\|\\mathbf{w}\\|^2')).toBe(true);
    expect(isPureLatex('y = \\beta_0 + \\sum_{j=1}^p \\beta_j x_j')).toBe(true);
  });

  it('returns false for plain English text or already delimited math', () => {
    expect(isPureLatex('Linear regression is a supervised model.')).toBe(false);
    expect(isPureLatex('The model equation is $y = mx + b$.')).toBe(false);
    expect(isPureLatex('$$J(\\theta) = 0$$')).toBe(false);
  });
});

describe('MathRenderer - Component Rendering', () => {
  it('renders null when text is null or empty', () => {
    const html = renderToString(<MathRenderer text="" />);
    expect(html).toBe('');
  });

  it('renders KaTeX HTML for inline formulas', () => {
    const html = renderToString(
      <MathRenderer text="The cost is $J(\theta)$ for parameter $\theta$." />
    );
    expect(html).toContain('katex');
    expect(html).toContain('The cost is');
  });

  it('renders KaTeX HTML for block formulas', () => {
    const html = renderToString(
      <MathRenderer text="$$J(\theta) = \frac{1}{2n}\sum_{i=1}^n (y_i - \hat{y}_i)^2$$" />
    );
    expect(html).toContain('katex-display');
  });

  it('renders pure raw LaTeX in display mode when block=true', () => {
    const html = renderToString(
      <MathRenderer text="\hat{y} = \mathbf{X}\boldsymbol{\beta}" block />
    );
    expect(html).toContain('katex-display');
  });

  it('handles currency cleanly without KaTeX errors', () => {
    const html = renderToString(
      <MathRenderer text="Values range from $100 to $20,000 for predicting $y$." />
    );
    expect(html).toContain('$100 to $20,000');
    expect(html).toContain('katex');
  });
});
