import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Cpu,
  Database,
  Sliders,
  CheckCircle,
  Sparkles,
  Layers,
  Clock,
  Play,
} from 'lucide-react';
import { HeroScene } from '@/three/HeroScene';
import { useReducedMotion } from '@/motion/useReducedMotion';
import { COPY } from '@/content/copy';
import { checkHealth } from '@/services/health';
import { getLessons } from '@/services/lessons';
import { getAlgorithms } from '@/services/algorithms';
import { getProgress, getLocalSessionId } from '@/services/progress';
import {
  LessonListResponse,
  AlgorithmSummary,
  LearnerProgressResponse,
} from '@/types/api';
import { Button, StatusDot, Chip } from '@/design-system/primitives';
import { ProvenanceBadge } from '@/components/feedback/ProvenanceBadge';

export function HomePage() {
  const { reducedMotion } = useReducedMotion();
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'unreachable' | 'running'>('running');
  const [lessons, setLessons] = useState<LessonListResponse | null>(null);
  const [algorithms, setAlgorithms] = useState<AlgorithmSummary[]>([]);
  const [progress, setProgress] = useState<LearnerProgressResponse | null>(null);

  // KNN live miniature simulation state for Chapter 03
  const [kVal, setKVal] = useState<number>(3);
  const [queryPt, setQueryPt] = useState({ x: 190, y: 110 });

  useEffect(() => {
    // Health check
    checkHealth()
      .then((h) => setHealthStatus(h.status === 'healthy' ? 'healthy' : 'unreachable'))
      .catch(() => setHealthStatus('unreachable'));

    // Fetch real lessons
    getLessons()
      .then(setLessons)
      .catch(() => setLessons(null));

    // Fetch real algorithms
    getAlgorithms()
      .then((res) => setAlgorithms(res.algorithms))
      .catch(() => setAlgorithms([]));

    // Fetch learner progress
    getProgress(getLocalSessionId())
      .then((p) => {
        if (p.total_completed > 0) setProgress(p);
      })
      .catch(() => null);
  }, []);

  // Algorithm counts derived strictly from backend response
  const regressionCount = algorithms.filter((a) => a.category === 'regression').length;
  const classificationCount = algorithms.filter((a) => a.category === 'classification').length;
  const unsupervisedCount = algorithms.filter((a) => a.category === 'unsupervised').length;

  return (
    <div className="relative w-full overflow-hidden font-body bg-ink-950 text-bone-100">
      {/* ---------------- CHAPTER 00: HERO (Signal into Structure) ---------------- */}
      <section className="relative min-h-[92vh] flex flex-col justify-end pb-16 px-4 sm:px-6 lg:px-8 border-b border-graphite-700/80">
        {/* WebGL Particle Vortex Hero Scene */}
        <HeroScene reducedMotion={reducedMotion} />

        {/* Content Container (Left-aligned, dark backdrop over calm left third) */}
        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Real Backend Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-graphite-900/90 border border-graphite-700 rounded-full text-xs font-mono select-none">
            <StatusDot status={healthStatus} />
            <span className="text-steel-400">
              {healthStatus === 'healthy'
                ? 'Backend connected'
                : healthStatus === 'unreachable'
                ? 'Backend unreachable'
                : 'Connecting to backend...'}
            </span>
          </div>

          {/* Headline & Subline from copy.ts */}
          <div className="space-y-4">
            <h1 className="font-display font-black text-4xl sm:text-7xl lg:text-8xl tracking-tight text-bone-100 leading-[0.92]">
              {COPY.hero.headline}
            </h1>
            <p className="text-lg sm:text-2xl text-steel-400 font-mono max-w-2xl leading-relaxed">
              {COPY.hero.subline}
            </p>
          </div>

          {/* Magnetic CTAs */}
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
                <span>{COPY.hero.ctaLab}</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Continue Learning Strip (Only rendered if progress contains real completed lessons) */}
        {progress && progress.total_completed > 0 && (
          <div className="relative z-10 mt-8 p-3 border border-lime-400/40 bg-lime-400/10 flex items-center justify-between text-xs font-mono max-w-2xl rounded-sm">
            <div className="flex items-center gap-2 text-lime-400 font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>Resume Learning: {progress.total_completed} lessons completed</span>
            </div>
            <Link to="/learn" className="text-bone-100 hover:text-lime-300 underline">
              Next Lesson →
            </Link>
          </div>
        )}
      </section>

      {/* ---------------- CHAPTER 01: LEARN (Curriculum Units Strip) ---------------- */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-graphite-700/80 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 border-b border-graphite-700/60 mb-10 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-lime-400 font-bold">
              Chapter 01 · Curriculum
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-bone-100 mt-1">
              Structured <span className="text-lime-400">Knowledge</span>
            </h2>
          </div>
          <Link
            to="/learn"
            className="text-xs font-mono text-lime-400 hover:text-lime-300 underline uppercase tracking-wider"
          >
            Explore all lessons →
          </Link>
        </div>

        {/* Pinned horizontal strip of units */}
        {!lessons ? (
          <div className="p-8 border border-dashed border-graphite-700 text-center font-mono text-xs text-steel-500">
            <ProvenanceBadge type="planned" subtext="Curriculum content has not been published yet." />
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

      {/* ---------------- CHAPTER 02: ALGORITHMS (Tall Asymmetric Panels) ---------------- */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-graphite-700/80 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 border-b border-graphite-700/60 mb-10 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-bold">
              Chapter 02 · Taxonomy
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-bone-100 mt-1">
              Algorithm <span className="text-cyan-400">Library</span>
            </h2>
          </div>
          <Link
            to="/algorithms"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline uppercase tracking-wider"
          >
            Open library catalogue →
          </Link>
        </div>

        {/* Three Tall Asymmetric Panels with Decorative Motifs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Regression Panel */}
          <div className="p-8 border border-graphite-700 bg-graphite-850/40 rounded-sm flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="h-24 w-full mb-4 border border-graphite-700/60 bg-ink-950 p-2 flex items-center justify-center">
                {/* Decorative Linear Line Fit Motif (no numbers) */}
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
                {regressionCount > 0 ? `${regressionCount} Algorithms` : 'Live Registry'}
              </span>
              <span className="text-cyan-400 font-semibold">Trainable in Lab</span>
            </div>
          </div>

          {/* Classification Panel */}
          <div className="p-8 border border-graphite-700 bg-graphite-850/40 rounded-sm flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="h-24 w-full mb-4 border border-graphite-700/60 bg-ink-950 p-2 flex items-center justify-center">
                {/* Decorative Decision Boundary Motif */}
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
                {classificationCount > 0 ? `${classificationCount} Algorithms` : 'Live Registry'}
              </span>
              <span className="text-cyan-400 font-semibold">Trainable in Lab</span>
            </div>
          </div>

          {/* Unsupervised Panel */}
          <div className="p-8 border border-graphite-700 bg-graphite-850/40 rounded-sm flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="h-24 w-full mb-4 border border-graphite-700/60 bg-ink-950 p-2 flex items-center justify-center">
                {/* Decorative Cluster Motif */}
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

      {/* ---------------- CHAPTER 03: PLAYGROUND (Live KNN Demonstration) ---------------- */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-graphite-700/80 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 border-b border-graphite-700/60 mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <ProvenanceBadge type="illustrative-simulation" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-bone-100">
              Interactive <span className="text-orange-500">Playground</span>
            </h2>
            <p className="font-mono text-xs text-steel-400 mt-1">
              Click plane to place a query point · Drag K slider to update neighbors live
            </p>
          </div>
          <Link to="/playground">
            <Button variant="outline" size="sm" className="hover:border-orange-500 hover:text-orange-500">
              Full Playground Mode →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-4 border border-graphite-700 bg-ink-950 rounded-sm">
            <svg
              width="100%"
              height="260"
              viewBox="0 0 380 260"
              className="cursor-crosshair select-none"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 380;
                const y = ((e.clientY - rect.top) / rect.height) * 260;
                setQueryPt({ x: Math.round(x), y: Math.round(y) });
              }}
            >
              {/* Seeded points */}
              {[
                { x: 70, y: 70, l: 0 },
                { x: 110, y: 90, l: 0 },
                { x: 90, y: 130, l: 0 },
                { x: 130, y: 60, l: 0 },
                { x: 260, y: 180, l: 1 },
                { x: 290, y: 150, l: 1 },
                { x: 240, y: 210, l: 1 },
                { x: 300, y: 220, l: 1 },
              ].map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="6"
                  fill={p.l === 0 ? '#19E3FF' : '#C6FF3D'}
                />
              ))}

              {/* Query Point */}
              <circle
                cx={queryPt.x}
                cy={queryPt.y}
                r="8"
                fill="#FF6B1A"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </svg>
          </div>

          <div className="p-6 border border-graphite-700 bg-graphite-850/40 font-mono text-xs space-y-4 rounded-sm">
            <h4 className="font-bold text-bone-100 uppercase tracking-wider">
              KNN Demonstration Parameters
            </h4>
            <div>
              <label htmlFor="hp-k-slider" className="text-steel-400 block mb-2">
                K Nearest Neighbors: <span className="text-orange-500 font-bold">{kVal}</span>
              </label>
              <input
                id="hp-k-slider"
                type="range"
                min="1"
                max="5"
                step="2"
                value={kVal}
                onChange={(e) => setKVal(parseInt(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>
            <p className="text-[11px] font-sans text-steel-400 leading-relaxed">
              Permanent Provenance: Generated sample points, not a trained PADH LE BC model.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- CHAPTER 04: MODEL LAB (Workflow Rail Schematic) ---------------- */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-graphite-700/80 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 border-b border-graphite-700/60 mb-10 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-bold">
              Chapter 04 · Experimentation
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-bone-100 mt-1">
              Model <span className="text-cyan-400">Lab</span>
            </h2>
            <p className="font-mono text-xs text-steel-400 mt-1">
              Workflow schematic: How models are trained and benchmarked under identical conditions
            </p>
          </div>
          <Link to="/model-lab">
            <Button variant="cyan-solid" size="md" className="gap-2">
              <span>Enter The Lab</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Schematic Step Rail (A diagram of steps, not data) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 font-mono text-xs">
          {[
            { step: '01', title: 'Upload CSV', desc: 'Secure isolation' },
            { step: '02', title: 'Profile Data', desc: 'Missing & stats' },
            { step: '03', title: 'Target Feature', desc: 'Explicit picker' },
            { step: '04', title: 'Task Type', desc: 'Classify/Regress' },
            { step: '05', title: 'Train Models', desc: 'Leakage-free' },
            { step: '06', title: 'Compare & Tune', desc: 'Grid search delta' },
          ].map((item) => (
            <div
              key={item.step}
              className="p-4 border border-graphite-700 bg-graphite-850/30 rounded-sm"
            >
              <div className="text-cyan-400 font-bold text-sm">{item.step}</div>
              <div className="font-bold text-bone-100 mt-1">{item.title}</div>
              <div className="text-[11px] text-steel-500 mt-0.5">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Labelled Wireframe built from skeleton blocks with required caption */}
        <div className="mt-8 p-6 border border-graphite-700 bg-ink-950 rounded-sm space-y-3">
          <div className="text-xs font-mono text-steel-400 uppercase font-semibold">
            How results are presented
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-10 bg-graphite-800/40 border border-graphite-700/40 animate-pulse" />
            <div className="h-10 bg-graphite-800/40 border border-graphite-700/40 animate-pulse" />
            <div className="h-10 bg-graphite-800/40 border border-graphite-700/40 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ---------------- CHAPTER 05: PROJECTS (Planned Notice) ---------------- */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 border border-dashed border-graphite-700 bg-graphite-850/20 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <ProvenanceBadge type="planned" subtext="Chapter 05" />
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-bone-100">
              Guided Practical Case Studies
            </h2>
            <p className="text-xs sm:text-sm text-steel-400 font-mono max-w-2xl leading-relaxed">
              Real-world business problems designed around customer churn, house valuation, and predictive maintenance.
            </p>
          </div>
          <Link to="/projects">
            <Button variant="outline" size="sm">
              Inspect Planned Projects →
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
