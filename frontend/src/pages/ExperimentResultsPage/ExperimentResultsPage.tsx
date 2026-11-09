import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  Clock,
  BarChart2,
} from 'lucide-react';
import { getExperiment, getExperimentReport, tuneExperimentModel } from '@/services/experiments';
import {
  ExperimentResponse,
  ExperimentReportResponse,
  ExperimentTuneResponse,
  ModelEvaluationResult,
} from '@/types/api';
import { ConnectionError } from '@/components/feedback/ConnectionError';
import { Button, Chip, Callout } from '@/design-system/primitives';
import { ProvenanceBadge } from '@/components/feedback/ProvenanceBadge';
import { formatDuration, formatMetric } from '@/lib/formatters';

export function ExperimentResultsPage() {
  const { experimentId } = useParams<{ experimentId: string }>();
  const [experiment, setExperiment] = useState<ExperimentResponse | null>(null);
  const [report, setReport] = useState<ExperimentReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected model for detailed view & tuning
  const [activeModelId, setActiveModelId] = useState<string | null>(null);

  // Hyperparameter Tuning State
  const [tuning, setTuning] = useState(false);
  const [tuneFolds, setTuneFolds] = useState<number>(3);
  const [tuneResult, setTuneResult] = useState<ExperimentTuneResponse | null>(null);
  const [tuneError, setTuneError] = useState<string | null>(null);

  const loadData = async (id: string, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const [exp, rep] = await Promise.all([
        getExperiment(id, signal),
        getExperimentReport(id, signal).catch(() => null),
      ]);
      setExperiment(exp);
      setReport(rep);
      if (exp.results.length > 0) {
        setActiveModelId(exp.results[0].model_id);
      }
    } catch (err: any) {
      if (!signal?.aborted) {
        setError(err.message || 'Failed to load experiment results.');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!experimentId) return;
    const controller = new AbortController();
    loadData(experimentId, controller.signal);
    return () => controller.abort();
  }, [experimentId]);

  const handleTune = async (modelId: string) => {
    if (!experimentId) return;
    setTuning(true);
    setTuneError(null);
    setTuneResult(null);

    try {
      const res = await tuneExperimentModel(experimentId, {
        model_id: modelId,
        cv_folds: tuneFolds,
      });
      setTuneResult(res);
      // Reload experiment to reflect tuned status in results
      loadData(experimentId);
    } catch (err: any) {
      setTuneError(err.message || 'Tuning optimization failed.');
    } finally {
      setTuning(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-6 font-mono text-steel-400 animate-pulse">
        <div className="h-4 bg-graphite-700 w-32" />
        <div className="h-10 bg-graphite-700 w-1/2" />
        <div className="h-64 bg-graphite-800" />
      </div>
    );
  }

  if (error || !experiment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <ConnectionError
          requestName={`GET /api/experiments/${experimentId}`}
          message={error || 'Experiment results not found.'}
          onRetry={() => experimentId && loadData(experimentId)}
        />
      </div>
    );
  }

  const activeResult = experiment.results.find((r) => r.model_id === activeModelId) || experiment.results[0];
  const isClassification = experiment.task_type === 'classification';
  const comparison = experiment.comparison;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body">
      {/* Top Navigation & Status Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          to={`/model-lab?dataset=${experiment.dataset_id}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-steel-400 hover:text-cyan-400 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Model Lab</span>
        </Link>
        <ProvenanceBadge type="backend-result" subtext="Computed by scikit-learn" />
      </div>

      {/* Header — Dense Mono Lab Header */}
      <header className="border-b border-graphite-700 pb-8 mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Chip variant="cyan">{experiment.task_type.toUpperCase()}</Chip>
              <span className="text-xs font-mono text-lime-400 bg-lime-400/10 px-2 py-0.5 border border-lime-400/30 uppercase font-semibold">
                Status: {experiment.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-black text-bone-100">
              Experiment Analysis Report
            </h1>
          </div>

          <div className="font-mono text-xs text-steel-500 bg-ink-950 p-3 border border-graphite-700 space-y-1">
            <div>Target Feature: <span className="text-cyan-400 font-bold">{experiment.target_column}</span></div>
            <div>Dataset ID: <span className="text-bone-100">{experiment.dataset_id.slice(0, 10)}...</span></div>
            <div>Train/Test Split: <span className="text-bone-100">{((1 - experiment.test_size) * 100).toFixed(0)}% / {(experiment.test_size * 100).toFixed(0)}% (Seed {experiment.random_state})</span></div>
          </div>
        </div>

        {/* Global Warnings Panel if any returned */}
        {experiment.warnings && experiment.warnings.length > 0 && (
          <div className="mt-6">
            <Callout variant="warning" title="Dataset & Validation Warnings">
              <ul className="list-disc pl-4 space-y-1 text-xs">
                {experiment.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </Callout>
          </div>
        )}
      </header>

      {/* ---------------- BACKEND RECOMMENDATION & TRADE-OFFS ---------------- */}
      {comparison && (
        <section className="mb-10 p-6 border-l-4 border-l-cyan-400 border border-graphite-700 bg-graphite-800/40 rounded-sm space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-cyan-400" />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-bone-100">
                Backend Model Recommendation:{' '}
                <span className="text-cyan-400 font-extrabold">{comparison.best_model_name}</span>
              </h2>
            </div>
            <span className="text-xs font-mono text-steel-400">
              Ranked by {comparison.primary_metric_name} ({experiment.priority} priority)
            </span>
          </div>

          <p className="text-sm text-bone-100/90 leading-relaxed font-sans">
            {comparison.recommendation_reason}
          </p>

          <div className="p-3 bg-ink-950 border border-graphite-700/80 text-xs font-mono text-steel-400 leading-relaxed">
            <span className="text-cyan-400 font-bold">Trade-Off Analysis: </span>
            {comparison.tradeoff_analysis}
          </div>
        </section>
      )}

      {/* ---------------- SIDE-BY-SIDE COMPARISON TABLE ---------------- */}
      <section className="mb-12 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-steel-400 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <span>Side-by-Side Model Comparison</span>
          </h2>
          <span className="text-xs font-mono text-steel-500">
            {experiment.results.length} Models Benchmarked
          </span>
        </div>

        <div className="overflow-x-auto border border-graphite-700 bg-ink-900">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-graphite-700 bg-graphite-800 text-steel-400 uppercase tracking-wider">
              <tr>
                <th className="p-3">Rank & Model</th>
                {isClassification ? (
                  <>
                    <th className="p-3" title="Fraction of correct predictions overall">Accuracy</th>
                    <th className="p-3" title="Macro-averaged F1 score across classes">F1 (Macro)</th>
                    <th className="p-3" title="Macro-averaged precision">Precision</th>
                    <th className="p-3" title="Macro-averaged recall">Recall</th>
                  </>
                ) : (
                  <>
                    <th className="p-3" title="Coefficient of Determination (higher is better, can be negative)">R² Score</th>
                    <th className="p-3" title="Mean Absolute Error (lower is better)">MAE</th>
                    <th className="p-3" title="Root Mean Squared Error (lower is better)">RMSE</th>
                    <th className="p-3" title="Mean Squared Error">MSE</th>
                  </>
                )}
                <th className="p-3">Training Time</th>
                <th className="p-3">Generalization Gap</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-700/60">
              {experiment.results.map((r, idx) => {
                const isBest = comparison?.best_model_id === r.model_id;
                const isSelected = activeModelId === r.model_id;
                const m = r.metrics;

                return (
                  <tr
                    key={r.model_id}
                    onClick={() => setActiveModelId(r.model_id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-400/10'
                        : isBest
                        ? 'bg-graphite-800/40 hover:bg-graphite-800/60'
                        : 'hover:bg-graphite-800/20'
                    }`}
                  >
                    <td className="p-3 font-semibold text-bone-100 flex items-center gap-2">
                      <span className="font-mono text-steel-500">#{idx + 1}</span>
                      <span>{r.model_name}</span>
                      {isBest && (
                        <span className="px-1.5 py-0.2 text-[10px] bg-cyan-400 text-ink-950 font-bold uppercase rounded-xs">
                          Recommended
                        </span>
                      )}
                      {r.is_tuned && (
                        <span className="px-1.5 py-0.2 text-[10px] bg-lime-400 text-ink-950 font-bold uppercase rounded-xs">
                          Tuned
                        </span>
                      )}
                    </td>

                    {isClassification ? (
                      <>
                        <td className="p-3 text-cyan-400 font-bold">{formatMetric(m.accuracy)}</td>
                        <td className="p-3 text-bone-100">{formatMetric(m.f1_macro)}</td>
                        <td className="p-3 text-steel-400">{formatMetric(m.precision_macro)}</td>
                        <td className="p-3 text-steel-400">{formatMetric(m.recall_macro)}</td>
                      </>
                    ) : (
                      <>
                        <td className="p-3 text-cyan-400 font-bold">{formatMetric(m.r2)}</td>
                        <td className="p-3 text-bone-100">{formatMetric(m.mae)}</td>
                        <td className="p-3 text-steel-400">{formatMetric(m.rmse)}</td>
                        <td className="p-3 text-steel-400">{formatMetric(m.mse)}</td>
                      </>
                    )}

                    <td className="p-3 text-steel-400">{formatDuration(r.training_duration_seconds)}</td>

                    <td className="p-3">
                      {r.overfitting_warning ? (
                        <span className="text-orange-500 font-semibold" title={r.overfitting_warning}>
                          High Gap ⚠
                        </span>
                      ) : (
                        <span className="text-lime-400">Stable</span>
                      )}
                    </td>

                    <td className="p-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModelId(r.model_id);
                        }}
                        className="text-xs text-cyan-400 hover:underline uppercase"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ---------------- BEGINNER METRIC GLOSSARY & TRADEOFF GUIDE ---------------- */}
        <div className="p-6 border border-graphite-700 bg-graphite-850/30 rounded-sm space-y-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-bone-100">
              Beginner Guide: Understanding Evaluation Metrics & Model Selection
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-sans text-xs">
            {isClassification ? (
              <>
                <div className="p-3.5 bg-ink-950 border border-graphite-800 rounded-sm space-y-1">
                  <div className="font-mono text-cyan-400 font-bold">Accuracy</div>
                  <p className="text-steel-400 leading-relaxed text-[11px]">
                    Percentage of all predictions that were completely correct.
                  </p>
                  <p className="text-amber-400/90 text-[10px] font-mono">
                    Caution: High accuracy can be misleading if one class dominates!
                  </p>
                </div>

                <div className="p-3.5 bg-ink-950 border border-graphite-800 rounded-sm space-y-1">
                  <div className="font-mono text-lime-400 font-bold">Precision</div>
                  <p className="text-steel-400 leading-relaxed text-[11px]">
                    When the model predicts a class, how often is it actually right? High precision avoids costly false alarms.
                  </p>
                </div>

                <div className="p-3.5 bg-ink-950 border border-graphite-800 rounded-sm space-y-1">
                  <div className="font-mono text-lime-400 font-bold">Recall (Sensitivity)</div>
                  <p className="text-steel-400 leading-relaxed text-[11px]">
                    Out of all real positive cases, how many did the model find? Crucial when missing a positive is hazardous.
                  </p>
                </div>

                <div className="p-3.5 bg-ink-950 border border-graphite-800 rounded-sm space-y-1">
                  <div className="font-mono text-bone-100 font-bold">F1-Score (Macro)</div>
                  <p className="text-steel-400 leading-relaxed text-[11px]">
                    The harmonic balance between Precision and Recall. Favored over raw accuracy for balanced decision-making.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-3.5 bg-ink-950 border border-graphite-800 rounded-sm space-y-1">
                  <div className="font-mono text-cyan-400 font-bold">R² Score (Variance)</div>
                  <p className="text-steel-400 leading-relaxed text-[11px]">
                    Proportion of target variance captured by the model. 1.0 is a perfect fit; 0 means predicting the average.
                  </p>
                </div>

                <div className="p-3.5 bg-ink-950 border border-graphite-800 rounded-sm space-y-1">
                  <div className="font-mono text-bone-100 font-bold">MAE (Absolute Error)</div>
                  <p className="text-steel-400 leading-relaxed text-[11px]">
                    Average absolute distance between predictions and actual values, expressed directly in target units.
                  </p>
                </div>

                <div className="p-3.5 bg-ink-950 border border-graphite-800 rounded-sm space-y-1">
                  <div className="font-mono text-bone-100 font-bold">RMSE (Root Squared Error)</div>
                  <p className="text-steel-400 leading-relaxed text-[11px]">
                    Square root of mean squared error. Penalizes occasional large errors more severely than MAE.
                  </p>
                </div>

                <div className="p-3.5 bg-ink-950 border border-graphite-800 rounded-sm space-y-1">
                  <div className="font-mono text-steel-400 font-bold">Training Duration</div>
                  <p className="text-steel-400 leading-relaxed text-[11px]">
                    Time taken by the backend scikit-learn engine to fit the model. Simpler models train in milliseconds.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Contextual Clinical Note for Breast Cancer Dataset */}
          {isClassification &&
            (experiment.target_column.toLowerCase().includes('diag') ||
              experiment.results.some((r) =>
                r.metrics.classes?.some((c) => c.toLowerCase().includes('malignant'))
              )) && (
              <div className="p-4 bg-ink-950 border-l-4 border-l-amber-400 border border-graphite-800 rounded-sm space-y-1">
                <div className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
                  Educational Case Study: Why Recall & False Negatives Matter in Breast Cancer Classification
                </div>
                <p className="text-steel-300 font-sans text-xs leading-relaxed">
                  In diagnostic tasks like the Wisconsin Breast Cancer benchmark, a <strong>False Negative</strong> (classifying a malignant tumor as benign) can cause life-threatening delays in treatment. A <strong>False Positive</strong> (classifying benign tissue as malignant) triggers anxiety and follow-up biopsy, but is quickly caught. Therefore, machine learning practitioners prioritize models with <strong>High Recall</strong> on the Malignant class over models that simply achieve high overall accuracy by defaulting to the majority benign class.
                </p>
              </div>
            )}
        </div>
      </section>

      {/* ---------------- ACTIVE MODEL DETAILED INSPECTOR ---------------- */}
      {activeResult && (
        <div className="space-y-8 p-6 border border-graphite-700 bg-graphite-850/40 rounded-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-graphite-700/80 pb-4">
            <div>
              <div className="text-xs font-mono text-steel-500 uppercase tracking-wider">
                Detailed Diagnostic Inspector
              </div>
              <h3 className="text-xl font-display font-bold text-bone-100">
                {activeResult.model_name}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-steel-400">
                Training Time: {formatDuration(activeResult.training_duration_seconds)}
              </span>
            </div>
          </div>

          {/* Overfitting alert if reported by backend */}
          {activeResult.overfitting_warning && (
            <Callout variant="warning" title="Generalization Warning">
              {activeResult.overfitting_warning}
            </Callout>
          )}

          {/* Confusion Matrix (Classification only) */}
          {isClassification && activeResult.metrics.confusion_matrix && (
            <section className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-steel-400">
                Confusion Matrix (Ground Truth vs Prediction)
              </h4>
              <div className="p-4 border border-graphite-700 bg-ink-950 inline-block rounded-sm">
                <div className="text-[11px] font-mono text-steel-500 mb-2">
                  Rows: Actual Class · Columns: Predicted Class
                </div>
                <div className="overflow-x-auto">
                  <table className="border-collapse text-xs font-mono text-center">
                    <thead>
                      <tr>
                        <th className="p-2 text-steel-500"></th>
                        {activeResult.metrics.classes?.map((c) => (
                          <th key={c} className="p-2 text-cyan-400 font-bold border border-graphite-700">
                            Pred {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeResult.metrics.confusion_matrix.map((row, rIdx) => {
                        const actualLabel = activeResult.metrics.classes?.[rIdx] || String(rIdx);
                        return (
                          <tr key={rIdx}>
                            <th className="p-2 text-cyan-400 font-bold border border-graphite-700">
                              Act {actualLabel}
                            </th>
                            {row.map((cellVal, cIdx) => {
                              const isDiagonal = rIdx === cIdx;
                              return (
                                <td
                                  key={cIdx}
                                  className={`p-3 font-mono font-bold border border-graphite-700 ${
                                    isDiagonal
                                      ? 'bg-cyan-400/20 text-cyan-400'
                                      : cellVal > 0
                                      ? 'bg-coral-500/10 text-coral-400'
                                      : 'text-steel-600'
                                  }`}
                                >
                                  {cellVal}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* Cross Validation Summary if provided */}
          {activeResult.cv_scores && (
            <section className="space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-steel-400">
                Cross-Validation Summary ({activeResult.cv_scores.folds} Folds)
              </h4>
              <div className="p-4 border border-graphite-700 bg-ink-950 font-mono text-xs space-y-2">
                <div className="flex gap-4">
                  <div>Metric: <span className="text-cyan-400">{activeResult.cv_scores.metric}</span></div>
                  <div>Mean Score: <span className="text-bone-100 font-bold">{activeResult.cv_scores.mean}</span></div>
                  <div>Std Dev: <span className="text-steel-400">±{activeResult.cv_scores.std}</span></div>
                </div>
                <div className="text-[11px] text-steel-500">
                  Fold Scores: {activeResult.cv_scores.fold_scores.join(', ')}
                </div>
              </div>
            </section>
          )}

          {/* ---------------- HYPERPARAMETER TUNING SECTION ---------------- */}
          <section className="pt-6 border-t border-graphite-700/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Hyperparameter Grid Search Tuning</span>
                </h4>
                <p className="text-xs text-steel-400 font-sans mt-0.5">
                  Execute GridSearchCV cross-validation on this model to identify optimal parameters and inspect before/after metric deltas.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-mono text-steel-400">
                  <label htmlFor="cv-folds">Folds:</label>
                  <select
                    id="cv-folds"
                    value={tuneFolds}
                    onChange={(e) => setTuneFolds(parseInt(e.target.value) || 3)}
                    className="p-1.5 bg-ink-950 border border-graphite-700 text-bone-100 rounded-sm"
                  >
                    <option value="3">3 Folds</option>
                    <option value="5">5 Folds</option>
                  </select>
                </div>

                <Button
                  variant="lime-solid"
                  size="sm"
                  disabled={tuning}
                  isLoading={tuning}
                  onClick={() => handleTune(activeResult.model_id)}
                  className="gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Tune Hyperparameters</span>
                </Button>
              </div>
            </div>

            {tuneError && (
              <Callout variant="warning" title="Tuning Error">
                {tuneError}
              </Callout>
            )}

            {/* Tuning Before / After Delta Card */}
            {tuneResult && (
              <div className="p-5 border border-lime-400/40 bg-lime-400/5 rounded-sm space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lime-400 uppercase tracking-wider">
                    Tuning Result — {tuneResult.meaningful_improvement ? 'Performance Improved ✓' : 'Baseline Already Optimal'}
                  </span>
                  <span className="text-steel-400">
                    CV: {tuneFolds} Folds
                  </span>
                </div>

                <p className="text-sm font-sans text-bone-100">
                  {tuneResult.improvement_summary}
                </p>

                {/* Before / After Comparison Table */}
                <div className="overflow-x-auto border border-graphite-700 bg-ink-950">
                  <table className="w-full text-left">
                    <thead className="border-b border-graphite-700 text-steel-500 uppercase text-[11px]">
                      <tr>
                        <th className="p-2.5">Metric</th>
                        <th className="p-2.5">Before Tuning</th>
                        <th className="p-2.5">After Tuning</th>
                        <th className="p-2.5">Delta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-graphite-800">
                      {Object.keys(tuneResult.after_metrics)
                        .filter((k) => typeof tuneResult.after_metrics[k] === 'number')
                        .map((metricKey) => {
                          const beforeVal = tuneResult.before_metrics[metricKey];
                          const afterVal = tuneResult.after_metrics[metricKey];
                          const delta = typeof beforeVal === 'number' && typeof afterVal === 'number'
                            ? afterVal - beforeVal
                            : null;

                          return (
                            <tr key={metricKey}>
                              <td className="p-2.5 font-semibold uppercase text-steel-300">{metricKey}</td>
                              <td className="p-2.5 text-steel-400">{formatMetric(beforeVal)}</td>
                              <td className="p-2.5 text-lime-400 font-bold">{formatMetric(afterVal)}</td>
                              <td className="p-2.5">
                                {delta !== null ? (
                                  <span className={delta >= 0 ? 'text-lime-400' : 'text-coral-500'}>
                                    {delta >= 0 ? `+${delta.toFixed(4)}` : delta.toFixed(4)}{' '}
                                    <span className="text-[10px] text-steel-500 font-normal">
                                      (browser delta)
                                    </span>
                                  </span>
                                ) : '—'}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                <div className="text-[11px] text-steel-500">
                  Best Parameters Found: {JSON.stringify(tuneResult.best_parameters)}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
