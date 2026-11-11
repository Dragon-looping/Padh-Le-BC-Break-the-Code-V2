import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Lightbulb, AlertTriangle, Layers, BookOpen } from 'lucide-react';
import { getConcept } from '@/services/concepts';
import { ConceptDetail } from '@/types/api';
import { ConnectionError } from '@/components/feedback/ConnectionError';
import { Callout, Chip, MathRenderer } from '@/design-system/primitives';

export function ConceptPage() {
  const { conceptId } = useParams<{ conceptId: string }>();
  const [concept, setConcept] = useState<ConceptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConcept = async (id: string, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getConcept(id, signal);
      setConcept(data);
    } catch (err: any) {
      if (!signal?.aborted) {
        setError(err.message || 'Concept could not be found.');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!conceptId) return;
    const controller = new AbortController();
    loadConcept(conceptId, controller.signal);
    return () => controller.abort();
  }, [conceptId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 animate-pulse">
        <div className="h-4 bg-graphite-700 w-24" />
        <div className="h-10 bg-graphite-700 w-2/3" />
        <div className="h-40 bg-graphite-800" />
      </div>
    );
  }

  if (error || !concept) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ConnectionError
          requestName={`GET /api/concepts/${conceptId}`}
          message={error || 'Concept not found.'}
          onRetry={() => conceptId && loadConcept(conceptId)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link
          to="/learn"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-steel-400 hover:text-cyan-400 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Learning Hub</span>
        </Link>
      </div>

      <header className="border-b border-graphite-700 pb-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Chip variant="cyan">{concept.category}</Chip>
          <Chip variant="default">{concept.level}</Chip>
        </div>
        <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-bone-100">
          {concept.title}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-cyan-300/90 font-mono">
          <MathRenderer text={concept.short_definition} inline />
        </p>
      </header>

      <div className="space-y-8 font-sans leading-relaxed text-bone-100">
        <section className="space-y-2">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-steel-400 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
            <span>Explanation</span>
          </h2>
          <p className="text-base text-bone-100/95 leading-relaxed">
            <MathRenderer text={concept.simple_explanation} />
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-steel-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-lime-400" />
            <span>Practical Example</span>
          </h2>
          <div className="p-4 border-l-2 border-lime-400 bg-graphite-800/30 text-sm text-bone-100/90">
            <MathRenderer text={concept.real_world_example} />
          </div>
        </section>

        {concept.key_points && concept.key_points.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-steel-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Key Takeaways</span>
            </h2>
            <ul className="space-y-2">
              {concept.key_points.map((pt, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm p-3 border border-graphite-700/60 bg-graphite-800/20">
                  <span className="text-cyan-400 font-mono text-xs mt-0.5">•</span>
                  <span><MathRenderer text={pt} inline /></span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {concept.common_mistakes && concept.common_mistakes.length > 0 && (
          <Callout variant="warning" title="Watch Out: Common Mistakes">
            <ul className="list-disc pl-4 space-y-1 text-sm">
              {concept.common_mistakes.map((cm, i) => (
                <li key={i}><MathRenderer text={cm} inline /></li>
              ))}
            </ul>
          </Callout>
        )}

        {concept.related_concepts && concept.related_concepts.length > 0 && (
          <section className="pt-6 border-t border-graphite-700/60 space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-steel-500">
              Related Concepts
            </h2>
            <div className="flex flex-wrap gap-2">
              {concept.related_concepts.map((rc) => (
                <Link
                  key={rc}
                  to={`/concepts/${rc}`}
                  className="px-3 py-1 bg-graphite-800 border border-graphite-700 hover:border-cyan-400 text-xs font-mono text-cyan-400 transition-colors rounded-sm"
                >
                  {rc} →
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
