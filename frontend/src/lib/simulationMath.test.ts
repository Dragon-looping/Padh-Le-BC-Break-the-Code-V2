import { describe, it, expect } from 'vitest';
import {
  calculateEuclideanDistance,
  computeKnn,
  calculateOls,
  KnnPoint,
} from './simulationMath';

describe('Simulation Maths & KNN Engine', () => {
  it('computes exact Euclidean distance in 2D plane (3-4-5 triangle)', () => {
    const d = calculateEuclideanDistance({ x: 0, y: 0 }, { x: 3, y: 4 });
    expect(d).toBe(5);
  });

  it('computes Euclidean distance for coincident points as zero', () => {
    const d = calculateEuclideanDistance({ x: 120, y: 80 }, { x: 120, y: 80 });
    expect(d).toBe(0);
  });

  const samplePoints: KnnPoint[] = [
    { x: 10, y: 10, label: 0 }, // d to (12, 10) = 2
    { x: 15, y: 10, label: 0 }, // d to (12, 10) = 3
    { x: 25, y: 10, label: 1 }, // d to (12, 10) = 13
    { x: 30, y: 10, label: 1 }, // d to (12, 10) = 18
  ];

  it('selects exactly K nearest neighbors and sorts by distance', () => {
    const result = computeKnn({
      trainingPoints: samplePoints,
      queryPoint: { x: 12, y: 10 },
      k: 3,
    });

    expect(result.nearestNeighbors).toHaveLength(3);
    expect(result.nearestNeighbors[0].x).toBe(10);
    expect(result.nearestNeighbors[0].distance).toBe(2);
    expect(result.nearestNeighbors[1].x).toBe(15);
    expect(result.nearestNeighbors[1].distance).toBe(3);
    expect(result.nearestNeighbors[2].x).toBe(25);
    expect(result.nearestNeighbors[2].distance).toBe(13);
  });

  it('predicts winning class via majority voting', () => {
    const result = computeKnn({
      trainingPoints: samplePoints,
      queryPoint: { x: 12, y: 10 },
      k: 3,
    });

    expect(result.voteCounts[0]).toBe(2);
    expect(result.voteCounts[1]).toBe(1);
    expect(result.predictedLabel).toBe(0);
    expect(result.isTie).toBe(false);
  });

  it('never allows K to exceed available training points', () => {
    const result = computeKnn({
      trainingPoints: samplePoints, // 4 points
      queryPoint: { x: 0, y: 0 },
      k: 50, // oversized K
    });

    expect(result.kUsed).toBe(4);
    expect(result.nearestNeighbors).toHaveLength(4);
  });

  it('clamps K to minimum of 1', () => {
    const result = computeKnn({
      trainingPoints: samplePoints,
      queryPoint: { x: 0, y: 0 },
      k: 0, // invalid K
    });

    expect(result.kUsed).toBe(1);
    expect(result.nearestNeighbors).toHaveLength(1);
  });

  it('handles vote ties deterministically using closest neighbor distance', () => {
    const tiePoints: KnnPoint[] = [
      { x: 5, y: 0, label: 0 },  // distance to (0,0) = 5
      { x: 10, y: 0, label: 1 }, // distance to (0,0) = 10
      { x: 50, y: 0, label: 0 },
      { x: 60, y: 0, label: 1 },
    ];

    const result = computeKnn({
      trainingPoints: tiePoints,
      queryPoint: { x: 0, y: 0 },
      k: 2, // 1 vote for class 0 (dist 5), 1 vote for class 1 (dist 10)
    });

    expect(result.voteCounts[0]).toBe(1);
    expect(result.voteCounts[1]).toBe(1);
    expect(result.isTie).toBe(true);
    expect(result.predictedLabel).toBe(0);
    expect(result.tieBreakReason).toContain('broken deterministically');
  });

  it('computes Ordinary Least Squares slope, intercept and R2', () => {
    const points = [
      { x: 1, y: 3 },
      { x: 2, y: 5 },
      { x: 3, y: 7 },
      { x: 4, y: 9 },
    ];
    const { m, b, r2 } = calculateOls(points);
    expect(m).toBeCloseTo(2);
    expect(b).toBeCloseTo(1);
    expect(r2).toBeCloseTo(1);
  });
});
