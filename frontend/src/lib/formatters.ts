import React from 'react';

export function formatMetric(val: unknown, decimals = 4): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'number') {
    if (isNaN(val)) return 'NaN';
    return Number(val.toFixed(decimals)).toString();
  }
  return String(val);
}

export function formatPercent(val: unknown): string {
  if (typeof val === 'number') {
    return (val * 100).toFixed(1) + '%';
  }
  return '—';
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  if (seconds < 1) {
    return `${(seconds * 1000).toFixed(0)} ms`;
  }
  return `${seconds.toFixed(2)} s`;
}
