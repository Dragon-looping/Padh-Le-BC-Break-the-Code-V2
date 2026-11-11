import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, CheckCircle2, AlertCircle, PlayCircle, Filter, ArrowRight } from 'lucide-react';
import { getAlgorithms } from '@/services/algorithms';
import { AlgorithmSummary } from '@/types/api';
import { ConnectionError } from '@/components/feedback/ConnectionError';
import { EmptyState } from '@/components/feedback/EmptyState';
import { SkeletonCard } from '@/components/feedback/Skeletons';
import { Chip } from '@/design-system/primitives';

export function AlgorithmLibraryPage() {
  const [algorithms, setAlgorithms] = useState<AlgorithmSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'regression' | 'classification' | 'unsupervised'>('all');
  const [trainableFilter, setTrainableFilter] = useState(false);

  const loadAlgorithms = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAlgorithms(
        {
          category: activeCategory !== 'all' ? activeCategory : undefined,
          trainable_only: trainableFilter,
        },
        signal
      );
      setAlgorithms(data.algorithms);
    } catch (err: any) {
      if (!signal?.aborted) {
        setError(err.message || 'Failed to load algorithm catalogue.');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadAlgorithms(controller.signal);
    return () => controller.abort();
  }, [activeCategory, trainableFilter]);

  const categories = [
    { id: 'regression', title: 'Regression Models', desc: 'Predict continuous numerical outcomes' },
    { id: 'classification', title: 'Classification Models', desc: 'Categorize inputs into discrete classes or probabilities' },
    { id: 'unsupervised', title: 'Unsupervised Learning', desc: 'Discover hidden structures, clusters, and dimensionality reduction' },
  ];

  const displayedCategories = activeCategory === 'all'
    ? categories
    : categories.filter((c) => c.id === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-graphite-700 pb-8 mb-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 text-xs font-mono border border-cyan-400/40 bg-cyan-400/10 text-cyan-400 mb-4 rounded-sm">
          <Cpu className="w-3.5 h-3.5" />
          <span>MODEL REGISTRY & TAXONOMY</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-bone-100">
          Algorithm <span className="text-cyan-400">Library</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-steel-400 max-w-2xl leading-relaxed">
          Comprehensive catalogue of machine learning estimators. Inspect algorithm intuition, mathematics, and scikit-learn code.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'regression', 'classification', 'unsupervised'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-mono tracking-wider uppercase transition-colors rounded-sm border ${
                  activeCategory === cat
                    ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400 font-bold'
                    : 'border-graphite-700 bg-graphite-800/40 text-steel-400 hover:text-bone-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs font-mono text-steel-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={trainableFilter}
              onChange={(e) => setTrainableFilter(e.target.checked)}
              className="accent-cyan-400 w-4 h-4 rounded"
            />
            <span>Show Trainable in Model Lab Only</span>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <ConnectionError
          requestName="GET /api/algorithms"
          message={error}
          onRetry={() => loadAlgorithms()}
        />
      ) : algorithms.length === 0 ? (
        <EmptyState
          title="No Algorithms Match Filter"
          description="Try loosening your filters to view more estimators."
          icon="search"
          actionText="Reset Filters"
          onAction={() => {
            setActiveCategory('all');
            setTrainableFilter(false);
          }}
        />
      ) : (
        <div className="space-y-12">
          {displayedCategories.map((group) => {
            const groupAlgos = algorithms.filter((a) => a.category === group.id);
            if (groupAlgos.length === 0) return null;

            return (
              <section key={group.id} className="space-y-6">
                <div className="border-b border-graphite-700/60 pb-3">
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-bone-100">
                    {group.title}
                  </h2>
                  <p className="text-xs text-steel-500 font-mono mt-1">{group.desc}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupAlgos.map((algo) => (
                    <div
                      key={algo.id}
                      className="p-6 border border-graphite-700 bg-graphite-800/25 hover:border-cyan-400/80 transition-all flex flex-col justify-between rounded-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <Chip variant="default">{algo.task_type}</Chip>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 border uppercase tracking-wider ${
                              algo.curriculum_status === 'in-syllabus'
                                ? 'border-lime-400/30 text-lime-400 bg-lime-400/5'
                                : 'border-steel-500/30 text-steel-500 bg-graphite-800'
                            }`}
                          >
                            {algo.curriculum_status}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-bone-100 hover:text-cyan-400 transition-colors">
                          <Link to={`/algorithms/${algo.id}`}>{algo.name}</Link>
                        </h3>

                        <p className="text-xs text-steel-400 leading-relaxed font-sans line-clamp-3">
                          {algo.short_description}
                        </p>
                      </div>

                      <div className="pt-6 border-t border-graphite-700/60 mt-4 space-y-3">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-steel-500">Model Lab:</span>
                          {algo.training_supported ? (
                            <span className="text-cyan-400 flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Trainable</span>
                            </span>
                          ) : (
                            <span className="text-steel-500 flex items-center gap-1">
                              <span>Theory Only</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <Link
                            to={`/algorithms/${algo.id}`}
                            className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <span>Learn Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>

                          {algo.training_supported && (
                            <Link
                              to={`/model-lab?model=${algo.id}`}
                              className="px-2.5 py-1 text-[11px] font-mono bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 border border-cyan-400/40 rounded-sm"
                            >
                              Try in Lab →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
