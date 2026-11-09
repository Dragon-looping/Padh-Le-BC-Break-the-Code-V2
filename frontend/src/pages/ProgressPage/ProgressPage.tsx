import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, Database, ArrowRight, ShieldAlert, Award } from 'lucide-react';
import { getProgress, getLocalSessionId } from '@/services/progress';
import { getExperiments } from '@/services/experiments';
import { LearnerProgressResponse, ExperimentSummary } from '@/types/api';
import { ConnectionError } from '@/components/feedback/ConnectionError';
import { Button, Chip } from '@/design-system/primitives';
import { ProvenanceBadge } from '@/components/feedback/ProvenanceBadge';

export function ProgressPage() {
  const [progress, setProgress] = useState<LearnerProgressResponse | null>(null);
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = getLocalSessionId();

  const loadData = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const [prog, exps] = await Promise.all([
        getProgress(sessionId, signal),
        getExperiments({ limit: 10 }, signal).catch(() => ({ total: 0, experiments: [] })),
      ]);
      setProgress(prog);
      setExperiments(exps.experiments);
    } catch (err: any) {
      if (!signal?.aborted) {
        setError(err.message || 'Failed to load progress ledger.');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-6 font-mono text-steel-400 animate-pulse">
        <div className="h-4 bg-graphite-700 w-32" />
        <div className="h-10 bg-graphite-700 w-1/2" />
        <div className="h-48 bg-graphite-800" />
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <ConnectionError
          requestName="GET /api/progress"
          message={error || 'Progress records could not be fetched.'}
          onRetry={() => loadData()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body">
      {/* Header */}
      <div className="border-b border-graphite-700 pb-8 mb-10">
        <div className="flex items-center gap-2 mb-3">
          <ProvenanceBadge type="backend-result" subtext="Session Progress Ledger" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black text-bone-100">
          My <span className="text-lime-400">Progress</span>
        </h1>
        <p className="mt-2 text-base text-steel-400 font-mono">
          Session Ledger ID: <code className="text-bone-100 bg-graphite-800 px-2 py-0.5">{progress.session_id}</code>
        </p>

        {/* Honesty Notice (Honesty Rule: No account or sync claims) */}
        <div className="mt-4 p-3 border border-graphite-700 bg-ink-950 text-xs font-mono text-steel-500">
          Note: Learner progress is tracked by local session ID. No account synchronization exists yet.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Completed Lessons Overview */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 border border-graphite-700 bg-graphite-850/40 rounded-sm space-y-4">
            <div className="flex items-center justify-between border-b border-graphite-700/60 pb-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-lime-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Completed Lessons ({progress.total_completed})</span>
              </h2>
              <Link to="/learn" className="text-xs font-mono text-steel-400 hover:text-lime-400">
                Learning Hub →
              </Link>
            </div>

            {progress.completed_lessons.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-steel-500 border border-dashed border-graphite-700">
                No lessons completed yet. Visit Learning Hub to begin Unit 1.
              </div>
            ) : (
              <ul className="divide-y divide-graphite-700/60 font-mono text-xs">
                {progress.completed_lessons.map((lessonId) => {
                  const rec = progress.recent_lessons.find((r) => r.lesson_id === lessonId);
                  return (
                    <li key={lessonId} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle className="w-4 h-4 text-lime-400 shrink-0" />
                        <Link to={`/learn/${lessonId}`} className="text-bone-100 hover:text-lime-400">
                          {lessonId}
                        </Link>
                      </div>
                      <span className="text-steel-500 text-[11px]">
                        {rec ? new Date(rec.completed_at).toLocaleDateString() : 'Completed'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Recent Experiments History */}
          <div className="p-6 border border-graphite-700 bg-graphite-850/40 rounded-sm space-y-4">
            <div className="flex items-center justify-between border-b border-graphite-700/60 pb-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>Recent Model Lab Experiments</span>
              </h2>
              <Link to="/model-lab" className="text-xs font-mono text-steel-400 hover:text-cyan-400">
                New Run →
              </Link>
            </div>

            {experiments.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-steel-500 border border-dashed border-graphite-700">
                No experiments recorded in backend yet. Upload a CSV in Model Lab to run comparisons.
              </div>
            ) : (
              <div className="divide-y divide-graphite-700/60 font-mono text-xs">
                {experiments.map((exp) => (
                  <div key={exp.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-bone-100">
                        Target: <span className="text-cyan-400">{exp.target_column}</span> ({exp.task_type})
                      </div>
                      <div className="text-[11px] text-steel-500 mt-0.5">
                        ID: {exp.id.slice(0, 8)}... · {exp.model_count} models trained
                      </div>
                    </div>

                    <Link to={`/experiments/${exp.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        View Results →
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Summary & Honesty Rule on Achievements */}
        <div className="space-y-6">
          <div className="p-6 border border-graphite-700 bg-graphite-800/25 rounded-sm space-y-4 font-mono text-xs">
            <h3 className="font-bold uppercase tracking-wider text-steel-400">
              Curriculum Milestone
            </h3>
            <div className="text-3xl font-bold text-lime-400">
              {progress.total_completed} <span className="text-sm text-steel-500 font-normal">/ 11 lessons</span>
            </div>
            <div
              className="w-full bg-graphite-700 h-2 overflow-hidden rounded-full"
              role="progressbar"
              aria-valuenow={progress.total_completed}
              aria-valuemin={0}
              aria-valuemax={11}
            >
              <div
                className="bg-lime-400 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (progress.total_completed / 11) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-steel-500 leading-relaxed font-sans">
              Complete lessons in Learning Hub to unlock deeper model evaluation topics.
            </p>
          </div>

          <div className="p-6 border border-dashed border-graphite-700 bg-graphite-800/10 rounded-sm space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-steel-400 font-bold uppercase">
              <Award className="w-4 h-4 text-steel-500" />
              <span>Achievements</span>
            </div>
            <ProvenanceBadge type="planned" subtext="Not in current release" />
            <p className="text-[11px] font-sans text-steel-500 leading-relaxed">
              Gamified certificates and badges will unlock once verified against the backend achievement engine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
