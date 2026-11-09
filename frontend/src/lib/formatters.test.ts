import { describe, it, expect } from 'vitest';
import { formatMetric, formatPercent, formatBytes, formatDuration } from './formatters';

describe('formatters', () => {
  it('formats metric numbers with proper precision and handles nullish values', () => {
    expect(formatMetric(0.854321)).toBe('0.8543');
    expect(formatMetric(null)).toBe('—');
    expect(formatMetric(undefined)).toBe('—');
    expect(formatMetric(NaN)).toBe('NaN');
    expect(formatMetric(-0.12345)).toBe('-0.1235');
  });

  it('formats percentages correctly', () => {
    expect(formatPercent(0.925)).toBe('92.5%');
    expect(formatPercent(null)).toBe('—');
  });

  it('formats byte sizes cleanly', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1024 * 1024 * 5)).toBe('5 MB');
  });

  it('formats duration in ms or seconds', () => {
    expect(formatDuration(0.045)).toBe('45 ms');
    expect(formatDuration(1.234)).toBe('1.23 s');
  });
});
