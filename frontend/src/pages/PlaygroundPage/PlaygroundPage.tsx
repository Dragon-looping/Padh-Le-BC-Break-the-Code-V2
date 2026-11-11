import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, Sliders, RotateCcw, HelpCircle } from 'lucide-react';
import { ProvenanceBadge } from '@/components/feedback/ProvenanceBadge';
import { Button, MathRenderer } from '@/design-system/primitives';

interface Point {
  x: number;
  y: number;
  label?: number;
}

export function PlaygroundPage() {
  const { algorithmId } = useParams<{ algorithmId?: string }>();
  const [activeTab, setActiveTab] = useState<'knn' | 'linear' | 'kmeans'>(
    (algorithmId as any) || 'knn'
  );

  const [kValue, setKValue] = useState<number>(3);
  const [queryPoint, setQueryPoint] = useState<Point>({ x: 180, y: 140 });

  const [knnPoints, setKnnPoints] = useState<Point[]>([
    { x: 60, y: 80, label: 0 },
    { x: 90, y: 120, label: 0 },
    { x: 120, y: 90, label: 0 },
    { x: 80, y: 160, label: 0 },
    { x: 140, y: 130, label: 0 },
    { x: 110, y: 60, label: 0 },
    { x: 260, y: 190, label: 1 },
    { x: 290, y: 220, label: 1 },
    { x: 240, y: 250, label: 1 },
    { x: 310, y: 180, label: 1 },
    { x: 270, y: 270, label: 1 },
    { x: 220, y: 210, label: 1 },
  ]);

  const knnResult = useMemo(() => {
    const distances = knnPoints.map((p, idx) => {
      const dx = p.x - queryPoint.x;
      const dy = p.y - queryPoint.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return { ...p, dist, idx };
    });

    distances.sort((a, b) => a.dist - b.dist);
    const neighbors = distances.slice(0, kValue);

    const vote0 = neighbors.filter((n) => n.label === 0).length;
    const vote1 = neighbors.filter((n) => n.label === 1).length;
    const predictedLabel = vote1 > vote0 ? 1 : 0;

    return { neighbors, predictedLabel, vote0, vote1 };
  }, [knnPoints, queryPoint, kValue]);

  const [regressionPoints, setRegressionPoints] = useState<Point[]>([
    { x: 50, y: 240 },
    { x: 100, y: 210 },
    { x: 150, y: 170 },
    { x: 200, y: 140 },
    { x: 250, y: 110 },
    { x: 300, y: 80 },
  ]);

  const olsFit = useMemo(() => {
    const n = regressionPoints.length;
    if (n < 2) return { m: 0, b: 0, r2: 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    regressionPoints.forEach((p) => {
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumXX += p.x * p.x;
    });

    const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    const meanY = sumY / n;
    let ssTot = 0, ssRes = 0;
    regressionPoints.forEach((p) => {
      const predY = m * p.x + b;
      ssTot += Math.pow(p.y - meanY, 2);
      ssRes += Math.pow(p.y - predY, 2);
    });
    const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

    return { m, b, r2 };
  }, [regressionPoints]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body">
      <div className="border-b border-graphite-700 pb-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <ProvenanceBadge type="illustrative-simulation" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-black text-bone-100">
              Interactive <span className="text-orange-500">Playground</span>
            </h1>
            <p className="font-mono text-xs text-orange-400/90 mt-1">
              Generated sample points, not a trained PADH LE BC model.
            </p>
          </div>

          <Link to="/model-lab">
            <Button variant="outline" size="sm" className="gap-2">
              <span>Go to Real Model Lab →</span>
            </Button>
          </Link>
        </div>

        <div className="mt-8 flex gap-2 font-mono text-xs">
          {[
            { id: 'knn', label: 'KNN Classification' },
            { id: 'linear', label: 'Linear Regression (OLS)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 uppercase border rounded-sm transition-all ${
                activeTab === tab.id
                  ? 'border-orange-500 bg-orange-500/10 text-orange-500 font-bold'
                  : 'border-graphite-700 bg-graphite-800/40 text-steel-400 hover:text-bone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'knn' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-6 border border-graphite-700 bg-graphite-850/40 rounded-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs uppercase tracking-wider text-steel-300 font-bold">
                Interactive KNN Feature Plane (Click anywhere to move query point)
              </h3>
              <span className="text-xs font-mono text-steel-500">
                K = {kValue}
              </span>
            </div>

            <div className="border border-graphite-700 bg-ink-950 p-2 rounded-sm overflow-hidden flex justify-center">
              <svg
                width="100%"
                height="320"
                viewBox="0 0 380 320"
                className="cursor-crosshair select-none max-w-lg"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 380;
                  const y = ((e.clientY - rect.top) / rect.height) * 320;
                  setQueryPoint({ x: Math.round(x), y: Math.round(y) });
                }}
              >
                <defs>
                  <pattern id="grid" width="38" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 38 0 L 0 0 0 32" fill="none" stroke="#1D2128" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="380" height="320" fill="url(#grid)" />

                {knnResult.neighbors.map((nb, i) => (
                  <line
                    key={i}
                    x1={queryPoint.x}
                    y1={queryPoint.y}
                    x2={nb.x}
                    y2={nb.y}
                    stroke="#FF6B1A"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.8"
                  />
                ))}

                {knnPoints.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="7"
                    fill={p.label === 0 ? '#19E3FF' : '#C6FF3D'}
                    stroke="#07080A"
                    strokeWidth="2"
                  />
                ))}

                <circle
                  cx={queryPoint.x}
                  cy={queryPoint.y}
                  r="12"
                  fill="none"
                  stroke="#FF6B1A"
                  strokeWidth="2"
                  className="animate-ping"
                  opacity="0.6"
                />
                <circle
                  cx={queryPoint.x}
                  cy={queryPoint.y}
                  r="8"
                  fill="#FF6B1A"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-steel-500 pt-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Class 0
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-400" /> Class 1
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Query (x={queryPoint.x}, y={queryPoint.y})
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 border border-graphite-700 bg-graphite-800/40 rounded-sm space-y-4 font-mono text-xs">
              <h4 className="uppercase font-bold text-bone-100 tracking-wider">
                Simulation Controls
              </h4>

              <div>
                <label htmlFor="k-slider" className="block text-steel-400 mb-2">
                  Select K (Neighbors): <span className="text-orange-500 font-bold">{kValue}</span>
                </label>
                <input
                  id="k-slider"
                  type="range"
                  min="1"
                  max="7"
                  step="2"
                  value={kValue}
                  onChange={(e) => setKValue(parseInt(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-steel-500 mt-1">
                  <span>1</span>
                  <span>3</span>
                  <span>5</span>
                  <span>7</span>
                </div>
              </div>

              <div className="p-3 bg-ink-950 border border-graphite-700 space-y-2">
                <div className="text-steel-400 uppercase text-[11px]">Neighbor Majority Vote:</div>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-cyan-400">Class 0: {knnResult.vote0}</span>
                  <span className="text-lime-400">Class 1: {knnResult.vote1}</span>
                </div>
                <div className="pt-2 border-t border-graphite-800 flex justify-between items-center text-xs">
                  <span className="text-steel-400">Predicted Class:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-sm ${knnResult.predictedLabel === 0 ? 'bg-cyan-400/20 text-cyan-400' : 'bg-lime-400/20 text-lime-400'}`}>
                    Class {knnResult.predictedLabel}
                  </span>
                </div>
              </div>

              <p className="text-[11px] font-sans text-steel-400 leading-relaxed">
                KNN does not learn explicit parameters ($\theta$). It computes Euclidean distance to all stored samples in memory and assigns the majority label among the $K$ closest neighbors.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'linear' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-6 border border-graphite-700 bg-graphite-850/40 rounded-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs uppercase tracking-wider text-steel-300 font-bold">
                Ordinary Least Squares (Residuals & Line Fit)
              </h3>
              <span className="text-xs font-mono text-steel-500">
                R² = {olsFit.r2.toFixed(3)}
              </span>
            </div>

            <div className="border border-graphite-700 bg-ink-950 p-2 rounded-sm overflow-hidden flex justify-center">
              <svg width="100%" height="320" viewBox="0 0 380 320" className="select-none max-w-lg">
                <rect width="380" height="320" fill="#0C0E11" />

                <line
                  x1="0"
                  y1={olsFit.b}
                  x2="380"
                  y2={olsFit.m * 380 + olsFit.b}
                  stroke="#19E3FF"
                  strokeWidth="2.5"
                />

                {regressionPoints.map((p, idx) => {
                  const fittedY = olsFit.m * p.x + olsFit.b;
                  return (
                    <line
                      key={idx}
                      x1={p.x}
                      y1={p.y}
                      x2={p.x}
                      y2={fittedY}
                      stroke="#FF5A6E"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  );
                })}

                {regressionPoints.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r="6"
                    fill="#C6FF3D"
                    stroke="#07080A"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-steel-500 pt-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-400" /> Data Points
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-cyan-400" /> Fitted Line (y = mx + b)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-coral-500" /> Residual Errors (y - ŷ)
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 border border-graphite-700 bg-graphite-800/40 rounded-sm space-y-4 font-mono text-xs">
            <h4 className="uppercase font-bold text-bone-100 tracking-wider">
              Mathematical Fit
            </h4>
            <div className="p-3 bg-ink-950 border border-graphite-700 space-y-1">
              <div className="flex items-center gap-1.5"><MathRenderer text="Slope ($m$):" inline /> <span className="text-cyan-400">{olsFit.m.toFixed(4)}</span></div>
              <div className="flex items-center gap-1.5"><MathRenderer text="Intercept ($b$):" inline /> <span className="text-cyan-400">{olsFit.b.toFixed(2)}</span></div>
              <div className="flex items-center gap-1.5"><MathRenderer text="Coefficient $R^2$:" inline /> <span className="text-lime-400">{olsFit.r2.toFixed(4)}</span></div>
            </div>
            <p className="text-[11px] font-sans text-steel-400 leading-relaxed">
              OLS minimizes the sum of squared vertical offsets (the red dashed residuals) between each observed point and the fitted hyperplane.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
