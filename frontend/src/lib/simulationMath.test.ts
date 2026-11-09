import { describe, it, expect } from 'vitest';

function calculateEuclideanDistance(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function calculateOls(points: Array<{ x: number; y: number }>) {
  const n = points.length;
  if (n < 2) return { m: 0, b: 0 };
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  points.forEach((p) => {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  });
  const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const b = (sumY - m * sumX) / n;
  return { m, b };
}

describe('Simulation Maths', () => {
  it('computes exact Euclidean distance in 2D plane', () => {
    const d = calculateEuclideanDistance({ x: 0, y: 0 }, { x: 3, y: 4 });
    expect(d).toBe(5);
  });

  it('computes Ordinary Least Squares slope and intercept', () => {
    // Points along y = 2x + 1
    const points = [
      { x: 1, y: 3 },
      { x: 2, y: 5 },
      { x: 3, y: 7 },
      { x: 4, y: 9 },
    ];
    const { m, b } = calculateOls(points);
    expect(m).toBeCloseTo(2);
    expect(b).toBeCloseTo(1);
  });
});
