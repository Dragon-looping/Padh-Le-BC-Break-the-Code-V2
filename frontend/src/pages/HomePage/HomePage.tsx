import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Cpu,
  Database,
  Sliders,
  Sparkles,
  Layers,
  RotateCcw,
  HelpCircle,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import { HeroScene } from '@/three/HeroScene';
import { useReducedMotion } from '@/motion/useReducedMotion';
import { COPY } from '@/content/copy';
import { getLessons } from '@/services/lessons';
import { getAlgorithms } from '@/services/algorithms';
import { LessonListResponse, AlgorithmSummary } from '@/types/api';
import { Button, Chip } from '@/design-system/primitives';
import { ProvenanceBadge } from '@/components/feedback/ProvenanceBadge';
import {
  computeKnn,
  KnnPoint,
  calculateEuclideanDistance,
} from '@/lib/simulationMath';

const KNN_TRAINING_POINTS: KnnPoint[] = [
  { x: 75, y: 80, label: 0, name: 'A1' },
  { x: 110, y: 65, label: 0, name: 'A2' },
  { x: 95, y: 115, label: 0, name: 'A3' },
  { x: 140, y: 90, label: 0, name: 'A4' },
  { x: 80, y: 150, label: 0, name: 'A5' },
  { x: 130, y: 145, label: 0, name: 'A6' },
  { x: 165, y: 110, label: 0, name: 'A7' },

  { x: 255, y: 175, label: 1, name: 'B1' },
  { x: 290, y: 150, label: 1, name: 'B2' },
  { x: 275, y: 210, label: 1, name: 'B3' },
  { x: 325, y: 185, label: 1, name: 'B4' },
  { x: 240, y: 225, label: 1, name: 'B5' },
  { x: 310, y: 235, label: 1, name: 'B6' },
  { x: 350, y: 210, label: 1, name: 'B7' },
];

export function HomePage() {
  const { reducedMotion } = useReducedMotion();
  const [lessons, setLessons] = useState<LessonListResponse | null>(null);
  const [algorithms, setAlgorithms] = useState<AlgorithmSummary[]>([]);

  const [kVal, setKVal] = useState<number>(3);
  const [queryPt, setQueryPt] = useState<{ x: number; y: number }>({ x: 200, y: 140 });

  useEffect(() => {
    getLessons()
      .then(setLessons)
      .catch(() => setLessons(null));

    getAlgorithms()
      .then((res) => setAlgorithms(res.algorithms))
      .catch(() => setAlgorithms([]));
  }, []);

  const regressionCount = algorithms.filter((a) => a.category === 'regression').length;
  const classificationCount = algorithms.filter((a) => a.category === 'classification').length;
  const unsupervisedCount = algorithms.filter((a) => a.category === 'unsupervised').length;

  const knnResult = useMemo(() => {
    return computeKnn({
      trainingPoints: KNN_TRAINING_POINTS,
      queryPoint: queryPt,
      k: kVal,
    });
  }, [queryPt, kVal]);

  const votesClass0 = knnResult.voteCounts[0] || 0;
  const votesClass1 = knnResult.voteCounts[1] || 0;
  const isClass0Winner = knnResult.predictedLabel === 0;

  return (
    <div className="relative w-full overflow-hidden font-body bg-ink-950 text-bone-100">
      <section className="relative min-h-[88vh] flex flex-col justify-end pb-16 px-4 sm:px-6 lg:px-8 border-b border-graphite-700/80">
        <HeroScene reducedMotion={reducedMotion} />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="space-y-4">
            <h1 className="font-display font-black text-4xl sm:text-7xl lg:text-8xl tracking-tight text-bone-100 leading-[0.92]">
              {COPY.hero.headline}
            </h1>
            <p className="text-lg sm:text-2xl text-steel-400 font-mono max-w-2xl leading-relaxed">
              {COPY.hero.subline}
            </p>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link to="/learn">
              <Button variant="cyan-solid" size="lg" className="gap-2">
                <span>{COPY.hero.ctaLearn}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link to="/model-lab">
              <Button variant="outline" size="lg" className="gap-2 hover:border-cyan-400">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Explore Model Lab</span>
              </Button>
            </Link>

            <Link to="/playground">
              <Button variant="ghost" size="lg" className="gap-2 text-steel-400 hover:text-bone-100">
                <Sliders className="w-4 h-4" />
                <span>Interactive Playground</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-graphite-700/80 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 border-b border-graphite-700/60 mb-10 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-lime-400 font-bold">
              Chapter 01 · Curriculum
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-bone-100 mt-1">
              Structured <span className="text-lime-400">Knowledge</span>
            </h2>
            <p className="font-mono text-xs text-steel-400 mt-1">
              Progressive lessons from machine learning intuition to mathematical formulations
            </p>
          </div>
          <Link
            to="/learn"
            className="text-xs font-mono text-lime-400 hover:text-lime-300 underline uppercase tracking-wider"
          >
            Explore all lessons →
          </Link>
        </div>

        {!lessons ? (
          <div className="p-8 border border-dashed border-graphite-700 text-center font-mono text-xs text-steel-500">
            Loading curriculum modules...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.units.map((unit, idx) => (
              <div
                key={unit.unit}
                className="p-6 border border-graphite-700 bg-graphite-850/40 hover:border-lime-400/80 transition-all rounded-sm flex flex-col justify-between"
              >
                <div>
                  <div className="font-mono text-4xl font-black text-lime-400/40 mb-2">
                    0{idx + 1}
                  </div>
                  <div className="text-xs font-mono uppercase tracking-wider text-lime-400 font-bold">
                    {unit.unit}
                  </div>
                  <h3 className="text-lg font-bold text-bone-100 mt-1 font-display">
                    {unit.module_title}
                  </h3>
                  <div className="mt-3 text-xs text-steel-500 font-mono">
                    {unit.lessons.length} structured lessons
                  </div>
                </div>

                <div className="pt-6 border-t border-graphite-700/60 mt-6 flex justify-end">
                  <Link
                    to={`/learn/${unit.lessons[0]?.id || ''}`}
                    className="text-xs font-mono text-lime-400 hover:text-lime-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Start Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-graphite-700/80 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 border-b border-graphite-700/60 mb-10 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-bold">
              Chapter 02 · Taxonomy
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-bone-100 mt-1">
              Algorithm <span className="text-cyan-400">Library</span>
            </h2>
            <p className="font-mono text-xs text-steel-400 mt-1">
              Intuition, mathematics, parameters, and python implementations
            </p>
          </div>
          <Link
            to="/algorithms"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline uppercase tracking-wider"
          >
            Open library catalogue →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 border border-graphite-700 bg-graphite-850/40 rounded-sm flex flex-col justify-between min-h-[340px]">
            <div>
              <div className="h-20 w-full mb-4 border border-graphite-700/60 bg-ink-950 p-2 flex items-center justify-center">
                <svg width="100%" height="100%" viewBox="0 0 120 60" className="overflow-visible">
                  <circle cx="20" cy="45" r="3" fill="#C6FF3D" />
                  <circle cx="45" cy="38" r="3" fill="#C6FF3D" />
                  <circle cx="70" cy="22" r="3" fill="#C6FF3D" />
                  <circle cx="95" cy="15" r="3" fill="#C6FF3D" />
                  <line x1="10" y1="52" x2="110" y2="10" stroke="#19E3FF" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-wider">
                Category
              </span>
              <h3 className="text-2xl font-display font-bold text-bone-100 mt-1">
                Regression
              </h3>
              <p className="text-xs text-steel-400 mt-2 leading-relaxed font-sans">
                Linear models, regularized L1/L2 penalties, and decision trees mapping continuous outcomes.
              </p>
            </div>
            <div className="pt-6 border-t border-graphite-700/60 font-mono text-xs flex items-center justify-between">
              <span className="text-steel-400">
                {regressionCount > 0 ? `${regressionCount} Algorithms` : '6 Algorithms'}
              </span>
              <span className="text-cyan-400 font-semibold">Trainable in Lab</span>
            </div>
          </div>

          <div className="p-8 border border-graphite-700 bg-graphite-850/40 rounded-sm flex flex-col justify-between min-h-[340px]">
            <div>
              <div className="h-20 w-full mb-4 border border-graphite-700/60 bg-ink-950 p-2 flex items-center justify-center">
                <svg width="100%" height="100%" viewBox="0 0 120 60">
                  <path d="M 0 30 Q 60 10 120 35" fill="none" stroke="#FF6B1A" strokeWidth="2" strokeDasharray="3 3" />
                  <circle cx="30" cy="18" r="3" fill="#19E3FF" />
                  <circle cx="50" cy="12" r="3" fill="#19E3FF" />
                  <circle cx="40" cy="48" r="3" fill="#C6FF3D" />
                  <circle cx="80" cy="45" r="3" fill="#C6FF3D" />
                </svg>
              </div>
              <span className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-wider">
                Category
              </span>
              <h3 className="text-2xl font-display font-bold text-bone-100 mt-1">
                Classification
              </h3>
              <p className="text-xs text-steel-400 mt-2 leading-relaxed font-sans">
                Logistic Regression, KNN, Naive Bayes, SVM, and ensembles learning class boundaries.
              </p>
            </div>
            <div className="pt-6 border-t border-graphite-700/60 font-mono text-xs flex items-center justify-between">
              <span className="text-steel-400">
                {classificationCount > 0 ? `${classificationCount} Algorithms` : '7 Algorithms'}
              </span>
              <span className="text-cyan-400 font-semibold">Trainable in Lab</span>
            </div>
          </div>

          <div className="p-8 border border-graphite-700 bg-graphite-850/40 rounded-sm flex flex-col justify-between min-h-[340px]">
            <div>
              <div className="h-20 w-full mb-4 border border-graphite-700/60 bg-ink-950 p-2 flex items-center justify-center">
                <svg width="100%" height="100%" viewBox="0 0 120 60">
                  <circle cx="30" cy="30" r="14" fill="none" stroke="#1D2128" strokeDasharray="2 2" />
                  <circle cx="28" cy="28" r="3" fill="#19E3FF" />
                  <circle cx="35" cy="32" r="3" fill="#19E3FF" />
                  <circle cx="85" cy="30" r="14" fill="none" stroke="#1D2128" strokeDasharray="2 2" />
                  <circle cx="83" cy="28" r="3" fill="#C6FF3D" />
                  <circle cx="88" cy="34" r="3" fill="#C6FF3D" />
                </svg>
              </div>
              <span className="text-xs font-mono text-steel-400 uppercase font-bold tracking-wider">
                Category
              </span>
              <h3 className="text-2xl font-display font-bold text-bone-100 mt-1">
                Unsupervised
              </h3>
              <p className="text-xs text-steel-400 mt-2 leading-relaxed font-sans">
                K-Means centroids, Hierarchical trees, DBSCAN density, and Principal Component Analysis.
              </p>
            </div>
            <div className="pt-6 border-t border-graphite-700/60 font-mono text-xs flex items-center justify-between">
              <span className="text-steel-400">
                {unsupervisedCount > 0 ? `${unsupervisedCount} Algorithms` : '4 Curricular'}
              </span>
              <span className="text-steel-500 font-semibold">Curriculum Only</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-graphite-700/80 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 border-b border-graphite-700/60 mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <ProvenanceBadge type="illustrative-simulation" subtext="Live 2D Euclidean KNN" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-bone-100">
              Interactive <span className="text-orange-500">KNN Demonstration</span>
            </h2>
            <p className="font-mono text-xs sm:text-sm text-steel-400 mt-1">
              Click anywhere on the coordinate plane to move the query point. Drag the slider to observe how $K$ changes the nearest neighbors and majority vote.
            </p>
          </div>
          <Link to="/playground">
            <Button variant="outline" size="sm" className="hover:border-orange-500 hover:text-orange-500">
              <span>Full Playground Mode →</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 border border-graphite-700 bg-ink-950 rounded-sm relative shadow-inner">
              <div className="flex items-center justify-between text-[11px] font-mono text-steel-400 mb-2 border-b border-graphite-800 pb-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span>Class A ({KNN_TRAINING_POINTS.filter((p) => p.label === 0).length})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-lime-400" />
                    <span>Class B ({KNN_TRAINING_POINTS.filter((p) => p.label === 1).length})</span>
                  </span>
                </div>
                <div className="text-orange-400 font-bold">
                  Query Point: ({queryPt.x}, {queryPt.y})
                </div>
              </div>

              <svg
                width="100%"
                height="320"
                viewBox="0 0 420 300"
                className="cursor-crosshair select-none bg-graphite-900/60 rounded border border-graphite-800"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.round(((e.clientX - rect.left) / rect.width) * 420);
                  const y = Math.round(((e.clientY - rect.top) / rect.height) * 300);
                  setQueryPt({ x: Math.max(15, Math.min(405, x)), y: Math.max(15, Math.min(285, y)) });
                }}
              >
                <defs>
                  <pattern id="hp-knn-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#22272e" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="420" height="300" fill="url(#hp-knn-grid)" />

                {knnResult.nearestNeighbors.map((neighbor) => (
                  <line
                    key={`line-${neighbor.name}`}
                    x1={queryPt.x}
                    y1={queryPt.y}
                    x2={neighbor.x}
                    y2={neighbor.y}
                    stroke={neighbor.label === 0 ? '#19E3FF' : '#C6FF3D'}
                    strokeWidth="1.8"
                    strokeDasharray="4 3"
                    className="opacity-75 transition-all duration-200"
                  />
                ))}

                {KNN_TRAINING_POINTS.map((pt) => {
                  const isNeighbor = knnResult.nearestNeighbors.some(
                    (n) => n.x === pt.x && n.y === pt.y
                  );
                  const color = pt.label === 0 ? '#19E3FF' : '#C6FF3D';

                  return (
                    <g key={`pt-${pt.name}`}>
                      {isNeighbor && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="12"
                          fill="none"
                          stroke={color}
                          strokeWidth="2"
                          strokeDasharray="3 2"
                          className="animate-pulse"
                        />
                      )}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isNeighbor ? '6' : '5'}
                        fill={color}
                        stroke="#0D1117"
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })}

                <g>
                  <circle
                    cx={queryPt.x}
                    cy={queryPt.y}
                    r="14"
                    fill="#FF6B1A"
                    fillOpacity="0.25"
                    className="animate-ping"
                  />
                  <circle
                    cx={queryPt.x}
                    cy={queryPt.y}
                    r="8"
                    fill="#FF6B1A"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                </g>
              </svg>

              <div className="flex items-center justify-between text-[11px] font-mono text-steel-500 mt-2 px-1">
                <span>Click coordinate plane to reposition query point</span>
                <button
                  onClick={() => setQueryPt({ x: 200, y: 140 })}
                  className="text-steel-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Center</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 border border-graphite-700 bg-graphite-850/50 rounded-sm space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-graphite-700/60 pb-3">
                <span className="text-steel-400 uppercase tracking-wider font-bold">
                  Majority Vote Prediction
                </span>
                <span className="text-[11px] text-steel-500 font-mono">K = {kVal}</span>
              </div>

              <div
                className={`p-4 border rounded-sm flex items-center justify-between ${
                  isClass0Winner
                    ? 'border-cyan-400/40 bg-cyan-950/25 text-cyan-300'
                    : 'border-lime-400/40 bg-lime-950/25 text-lime-300'
                }`}
              >
                <div>
                  <div className="text-[10px] uppercase tracking-wider opacity-80">
                    Predicted Class
                  </div>
                  <div className="text-xl font-display font-black">
                    {isClass0Winner ? 'Class A (Cyan)' : 'Class B (Lime)'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider opacity-80">Vote Share</div>
                  <div className="text-lg font-bold">
                    {Math.round(((isClass0Winner ? votesClass0 : votesClass1) / kVal) * 100)}%
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-cyan-400 font-bold">Class A: {votesClass0} votes</span>
                  <span className="text-lime-400 font-bold">Class B: {votesClass1} votes</span>
                </div>
                <div className="h-2 w-full bg-graphite-800 rounded-full overflow-hidden flex">
                  <div
                    className="bg-cyan-400 transition-all duration-200"
                    style={{ width: `${(votesClass0 / kVal) * 100}%` }}
                  />
                  <div
                    className="bg-lime-400 transition-all duration-200"
                    style={{ width: `${(votesClass1 / kVal) * 100}%` }}
                  />
                </div>
              </div>

              {knnResult.isTie && knnResult.tieBreakReason && (
                <div className="p-3 border border-orange-500/40 bg-orange-950/20 text-orange-300 text-[11px] rounded-sm font-sans leading-relaxed">
                  <span className="font-bold font-mono">Tie-Breaker Rule: </span>
                  {knnResult.tieBreakReason}
                </div>
              )}

              <div className="pt-2 border-t border-graphite-700/60 space-y-2">
                <div className="flex items-center justify-between text-steel-400">
                  <label htmlFor="hp-k-slider" className="font-bold">
                    Select K Neighbors: <span className="text-orange-400 font-mono text-sm">{kVal}</span>
                  </label>
                  <div className="flex gap-1">
                    {[1, 3, 5, 7].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setKVal(preset)}
                        className={`px-2 py-0.5 text-[10px] font-mono border rounded ${
                          kVal === preset
                            ? 'border-orange-500 bg-orange-500/20 text-orange-400 font-bold'
                            : 'border-graphite-700 text-steel-400 hover:text-bone-100'
                        }`}
                      >
                        K={preset}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  id="hp-k-slider"
                  type="range"
                  min="1"
                  max="9"
                  step="1"
                  value={kVal}
                  onChange={(e) => setKVal(parseInt(e.target.value, 10))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-graphite-700/60">
                <div className="text-[11px] text-steel-400 uppercase font-bold tracking-wider mb-2">
                  Top {kVal} Nearest Neighbors
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto font-mono text-[11px]">
                  {knnResult.nearestNeighbors.map((n, i) => (
                    <div
                      key={n.name}
                      className="flex items-center justify-between px-2 py-1 bg-ink-950/80 border border-graphite-800 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-steel-500">#{i + 1}</span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            n.label === 0 ? 'bg-cyan-400' : 'bg-lime-400'
                          }`}
                        />
                        <span className="text-bone-100">
                          {n.label === 0 ? 'Class A' : 'Class B'} ({n.name})
                        </span>
                      </div>
                      <span className="text-steel-400 font-mono">
                        d = {n.distance.toFixed(1)} px
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
          <div className="p-4 border border-graphite-700/80 bg-graphite-850/30 rounded-sm space-y-1.5">
            <div className="font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>01 · Euclidean Distance</span>
            </div>
            <p className="text-steel-300 leading-relaxed">
              Distance between query point $(x_q, y_q)$ and data point $(x_i, y_i)$ is computed using the Pythagorean metric:
            </p>
            <div className="font-mono text-[11px] text-bone-100 bg-ink-950 p-1.5 border border-graphite-800 rounded text-center">
              d = √((x_q - x_i)² + (y_q - y_i)²)
            </div>
          </div>

          <div className="p-4 border border-graphite-700/80 bg-graphite-850/30 rounded-sm space-y-1.5">
            <div className="font-mono text-lime-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>02 · Majority Voting</span>
            </div>
            <p className="text-steel-300 leading-relaxed">
              All training points are sorted strictly by distance ascending. The top $K$ points each cast one vote for their class. The class with the highest vote count wins the prediction.
            </p>
          </div>

          <div className="p-4 border border-graphite-700/80 bg-graphite-850/30 rounded-sm space-y-1.5">
            <div className="font-mono text-orange-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>03 · Why K Changes Outcome</span>
            </div>
            <p className="text-steel-300 leading-relaxed">
              When $K=1$, the model follows isolated points (low bias, high variance). When $K$ is larger, the boundary smooths out into majorities, filtering out local anomalies.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 border-b border-graphite-700/60 mb-10 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-bold">
              Chapter 04 · Experimentation
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-bone-100 mt-1">
              Model <span className="text-cyan-400">Lab</span>
            </h2>
            <p className="font-mono text-xs text-steel-400 mt-1">
              Train, evaluate, and compare genuine machine learning models with zero setup
            </p>
          </div>
          <Link to="/model-lab">
            <Button variant="cyan-solid" size="md" className="gap-2">
              <span>Open Model Lab</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="p-6 sm:p-8 border border-graphite-700 bg-graphite-850/30 rounded-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs text-cyan-400 uppercase font-bold tracking-wider">
                  Ready-to-Use Sample Datasets
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-bone-100 mt-1">
                Explore Real Machine Learning Without Uploading CSVs
              </h3>
            </div>
            <Link to="/model-lab">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <span>View Sample Datasets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-steel-400 font-sans max-w-3xl leading-relaxed">
            Beginners can immediately dive into empirical model benchmarking. Explore the standard <strong>Iris Flower Multiclass</strong> dataset or the <strong>Breast Cancer Diagnostic</strong> dataset to analyze accuracy, precision, recall, confusion matrices, and model tradeoffs.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <Link
              to="/model-lab"
              className="p-4 bg-ink-950 border border-graphite-700/80 hover:border-cyan-400 transition-colors rounded-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-bold">Iris Classification</span>
                <span className="text-[10px] text-steel-500 uppercase">150 rows</span>
              </div>
              <p className="text-[11px] text-steel-400 font-sans">
                Predict 3 flower species using 4 morphological dimensions with KNN, Decision Trees & SVM.
              </p>
            </Link>

            <Link
              to="/model-lab"
              className="p-4 bg-ink-950 border border-graphite-700/80 hover:border-cyan-400 transition-colors rounded-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-lime-400 font-bold">Breast Cancer</span>
                <span className="text-[10px] text-steel-500 uppercase">569 rows</span>
              </div>
              <p className="text-[11px] text-steel-400 font-sans">
                Binary diagnosis classification analyzing precision, recall, and minimizing false negatives.
              </p>
            </Link>

            <Link
              to="/model-lab"
              className="p-4 bg-ink-950 border border-graphite-700/80 hover:border-cyan-400 transition-colors rounded-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-bone-100 font-bold">Customer Churn</span>
                <span className="text-[10px] text-steel-500 uppercase">100 rows</span>
              </div>
              <p className="text-[11px] text-steel-400 font-sans">
                Subscriber cancellation risk classification with mixed categorical and numerical features.
              </p>
            </Link>

            <Link
              to="/model-lab"
              className="p-4 bg-ink-950 border border-graphite-700/80 hover:border-cyan-400 transition-colors rounded-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-bone-100 font-bold">Housing Valuation</span>
                <span className="text-[10px] text-steel-500 uppercase">100 rows</span>
              </div>
              <p className="text-[11px] text-steel-400 font-sans">
                Continuous property price regression evaluating Ridge, Lasso, and Random Forest models.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
