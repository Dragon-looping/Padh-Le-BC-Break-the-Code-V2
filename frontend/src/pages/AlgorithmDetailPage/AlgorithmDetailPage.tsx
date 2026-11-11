import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Cpu, CheckCircle2, Sliders, Check, X, Code2, Calculator, PlayCircle } from 'lucide-react';
import { getAlgorithm } from '@/services/algorithms';
import { AlgorithmDetail } from '@/types/api';
import { ConnectionError } from '@/components/feedback/ConnectionError';
import { CodeBlock, MathBlock, Button, Chip, MathRenderer } from '@/design-system/primitives';
import { ProvenanceBadge } from '@/components/feedback/ProvenanceBadge';

export function AlgorithmDetailPage() {
  const { algorithmId } = useParams<{ algorithmId: string }>();
  const [algo, setAlgo] = useState<AlgorithmDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (id: string, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAlgorithm(id, signal);
      setAlgo(data);
    } catch (err: any) {
      if (!signal?.aborted) {
        setError(err.message || 'Algorithm details could not be loaded.');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!algorithmId) return;
    const controller = new AbortController();
    loadData(algorithmId, controller.signal);
    return () => controller.abort();
  }, [algorithmId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-6 animate-pulse">
        <div className="h-4 bg-graphite-700 w-32" />
        <div className="h-10 bg-graphite-700 w-1/2" />
        <div className="h-48 bg-graphite-800" />
      </div>
    );
  }

  if (error || !algo) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <ConnectionError
          requestName={`GET /api/algorithms/${algorithmId}`}
          message={error || 'Algorithm not found.'}
          onRetry={() => algorithmId && loadData(algorithmId)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/algorithms"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-steel-400 hover:text-cyan-400 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Algorithm Library</span>
        </Link>
        <div className="flex items-center gap-2">
          {algo.learning_content_status === 'planned' && (
            <ProvenanceBadge type="planned" subtext="Content in progress" />
          )}
        </div>
      </div>

      <header className="border-b border-graphite-700 pb-8 mb-10">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <Chip variant="cyan">{algo.category}</Chip>
          <Chip variant="default">{algo.task_type}</Chip>
          <span className="text-xs font-mono text-steel-500 uppercase px-2 py-0.5 border border-graphite-700">
            {algo.curriculum_status}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <h1 className="text-3xl sm:text-5xl font-display font-black text-bone-100">
            {algo.name}
          </h1>

          {algo.training_supported ? (
            <Link to={`/model-lab?model=${algo.id}`}>
              <Button variant="cyan-solid" size="md" className="gap-2">
                <PlayCircle className="w-4 h-4" />
                <span>Try in Model Lab</span>
              </Button>
            </Link>
          ) : (
            <div className="text-xs font-mono text-steel-500 border border-graphite-700 p-2 text-center bg-graphite-800/40">
              Theoretical Curriculum Only
            </div>
          )}
        </div>

        <p className="mt-4 text-base sm:text-lg text-steel-300 font-mono leading-relaxed max-w-3xl">
          <MathRenderer text={algo.short_description} inline />
        </p>
      </header>

      <div className="space-y-12 font-sans leading-relaxed text-bone-100">
        {algo.intuition && (
          <section className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Core Intuition
            </h2>
            <div className="text-base text-bone-100/95 leading-relaxed bg-graphite-800/25 p-5 border border-graphite-700 rounded-sm">
              <MathRenderer text={algo.intuition} />
            </div>
          </section>
        )}

        {algo.mathematical_formula && (
          <section className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              <span>Mathematical Formulation</span>
            </h2>
            <div className="p-4 border border-graphite-700 bg-ink-900 rounded-sm">
              <MathBlock math={algo.mathematical_formula} displayMode={true} />
            </div>
          </section>
        )}

        {algo.step_by_step_working && algo.step_by_step_working.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-steel-400">
              How the Algorithm Works (Step-by-Step)
            </h2>
            <ol className="space-y-2 text-sm text-bone-100">
              {algo.step_by_step_working.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3.5 border border-graphite-700/60 bg-graphite-800/20">
                  <span className="font-mono text-cyan-400 text-xs font-bold shrink-0 mt-0.5">
                    Step {idx + 1}
                  </span>
                  <span><MathRenderer text={step} inline /></span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {algo.parameters && algo.parameters.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-steel-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Key Hyperparameters</span>
            </h2>
            <div className="overflow-x-auto border border-graphite-700 bg-ink-900">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-graphite-700 bg-graphite-800/60 text-steel-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Parameter</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Default</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite-700/50">
                  {algo.parameters.map((param) => (
                    <tr key={param.name} className="hover:bg-graphite-800/30">
                      <td className="p-3 font-bold text-cyan-400">{param.name}</td>
                      <td className="p-3 text-steel-500">{param.type}</td>
                      <td className="p-3 text-bone-100">{String(param.default)}</td>
                      <td className="p-3 text-steel-400 font-sans"><MathRenderer text={param.description} inline /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {algo.python_snippet && (
          <section className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Code2 className="w-4 h-4" />
              <span>Python Code (scikit-learn)</span>
            </h2>
            <CodeBlock code={algo.python_snippet} language="python" filename={`${algo.id}.py`} />
            {algo.code_explanation && (
              <p className="text-xs text-steel-400 leading-relaxed font-sans">
                <MathRenderer text={algo.code_explanation} />
              </p>
            )}
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {algo.advantages && algo.advantages.length > 0 && (
            <div className="p-5 border border-lime-400/30 bg-lime-400/5 rounded-sm space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Advantages</span>
              </h3>
              <ul className="space-y-2 text-xs text-bone-100 font-sans">
                {algo.advantages.map((adv, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-lime-400 font-mono mt-0.5">+</span>
                    <span><MathRenderer text={adv} inline /></span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {algo.limitations && algo.limitations.length > 0 && (
            <div className="p-5 border border-coral-500/30 bg-coral-500/5 rounded-sm space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-coral-500 flex items-center gap-1.5">
                <X className="w-4 h-4" />
                <span>Limitations</span>
              </h3>
              <ul className="space-y-2 text-xs text-bone-100 font-sans">
                {algo.limitations.map((lim, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-coral-500 font-mono mt-0.5">-</span>
                    <span><MathRenderer text={lim} inline /></span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {algo.when_to_use && algo.when_to_use.length > 0 && (
            <div className="p-5 border border-graphite-700 bg-graphite-800/30 rounded-sm space-y-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                When to Choose
              </h3>
              <ul className="list-disc pl-4 space-y-1 text-xs text-bone-100/90 font-sans">
                {algo.when_to_use.map((item, i) => (
                  <li key={i}><MathRenderer text={item} inline /></li>
                ))}
              </ul>
            </div>
          )}

          {algo.when_to_avoid && algo.when_to_avoid.length > 0 && (
            <div className="p-5 border border-graphite-700 bg-graphite-800/30 rounded-sm space-y-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-500">
                When to Avoid
              </h3>
              <ul className="list-disc pl-4 space-y-1 text-xs text-bone-100/90 font-sans">
                {algo.when_to_avoid.map((item, i) => (
                  <li key={i}><MathRenderer text={item} inline /></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
