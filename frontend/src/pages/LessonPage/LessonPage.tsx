import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, BookOpen, AlertCircle, HelpCircle, Code2, Calculator, Check, X } from 'lucide-react';
import { getLesson } from '@/services/lessons';
import { completeLesson, getProgress } from '@/services/progress';
import { LessonDetail, QuizQuestion } from '@/types/api';
import { ConnectionError } from '@/components/feedback/ConnectionError';
import { CodeBlock, MathBlock, Button, Callout, MathRenderer } from '@/design-system/primitives';

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [marking, setMarking] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  const loadLessonData = async (id: string, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const [data, progress] = await Promise.all([
        getLesson(id, signal),
        getProgress(undefined, signal).catch(() => null),
      ]);
      setLesson(data);
      if (progress && progress.completed_lessons.includes(id)) {
        setIsCompleted(true);
      }
    } catch (err: any) {
      if (!signal?.aborted) {
        setError(err.message || 'Failed to load lesson content.');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!lessonId) return;
    const controller = new AbortController();
    loadLessonData(lessonId, controller.signal);
    return () => controller.abort();
  }, [lessonId]);

  const handleMarkComplete = async () => {
    if (!lessonId || isCompleted) return;
    setMarking(true);
    try {
      await completeLesson(lessonId);
      setIsCompleted(true);
    } catch (err: any) {
      alert(err.message || 'Could not mark lesson complete.');
    } finally {
      setMarking(false);
    }
  };

  const handleSelectQuizOption = (questionId: string, optionId: string) => {
    if (quizSubmitted[questionId]) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleVerifyQuestion = (questionId: string) => {
    if (!selectedAnswers[questionId]) return;
    setQuizSubmitted((prev) => ({ ...prev, [questionId]: true }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 animate-pulse">
        <div className="h-4 bg-graphite-700 w-32" />
        <div className="h-10 bg-graphite-700 w-3/4" />
        <div className="h-48 bg-graphite-800" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ConnectionError
          requestName={`GET /api/lessons/${lessonId}`}
          message={error || 'Lesson could not be found.'}
          onRetry={() => lessonId && loadLessonData(lessonId)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/learn"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-steel-400 hover:text-lime-400 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Learning Hub</span>
        </Link>
        <span className="text-xs font-mono text-steel-500 uppercase">
          {lesson.unit} · {lesson.module}
        </span>
      </div>

      <div className="border-b border-graphite-700 pb-6 mb-8">
        <div className="flex items-center gap-2 mb-2 text-xs font-mono text-lime-400 uppercase tracking-widest font-semibold">
          <BookOpen className="w-4 h-4" />
          <span>LESSON {lesson.order} · {lesson.level} · {lesson.estimated_minutes} MIN</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-bone-100">
          {lesson.title}
        </h1>
      </div>

      <article className="space-y-10 text-bone-100/90 leading-relaxed text-base sm:text-lg">
        {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
          <section className="p-5 border border-lime-400/30 bg-lime-400/5 rounded-sm">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-lime-400 mb-3">
              Learning Objectives
            </h2>
            <ul className="space-y-2 text-sm text-bone-100">
              {lesson.learning_objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-lime-400 font-mono text-xs mt-1">0{i + 1}.</span>
                  <span><MathRenderer text={obj} inline /></span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {lesson.explanation && (
          <section className="space-y-4">
            <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-lime-400">
              Intuition & Concept
            </h2>
            <div className="text-base text-bone-100/95 leading-relaxed font-sans whitespace-pre-line">
              <MathRenderer text={lesson.explanation} />
            </div>
          </section>
        )}

        {lesson.definitions && lesson.definitions.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-steel-400">
              Core Definitions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans">
              {lesson.definitions.map((def, i) => (
                <div key={i} className="p-4 border border-graphite-700 bg-graphite-800/40 rounded-sm">
                  <div className="font-mono text-sm font-semibold text-lime-400 mb-1">
                    <MathRenderer text={def.term} inline />
                  </div>
                  <div className="text-xs text-steel-400 leading-relaxed">
                    <MathRenderer text={def.definition} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {lesson.mathematical_explanation && (
          <section className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              <span>Mathematical Formulation</span>
            </h2>
            <div className="p-4 border border-graphite-700 bg-ink-900 rounded-sm">
              <MathRenderer text={lesson.mathematical_explanation} />
            </div>
          </section>
        )}

        {lesson.real_world_example && (
          <section className="space-y-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-steel-400">
              Real-World Application
            </h2>
            <div className="p-4 border-l-2 border-lime-400 bg-graphite-800/30 text-sm leading-relaxed text-bone-100/90 font-sans">
              <MathRenderer text={lesson.real_world_example} />
            </div>
          </section>
        )}

        {lesson.step_by_step_working && lesson.step_by_step_working.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-steel-400">
              Step-by-Step Procedure
            </h2>
            <ol className="space-y-2 text-sm text-bone-100 font-sans">
              {lesson.step_by_step_working.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 border border-graphite-700/60 bg-graphite-800/20">
                  <span className="font-mono text-lime-400 text-xs font-bold shrink-0 mt-0.5">
                    Step {idx + 1}
                  </span>
                  <span><MathRenderer text={step} inline /></span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {lesson.python_code && (
          <section className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
              <Code2 className="w-4 h-4" />
              <span>Python Implementation (scikit-learn)</span>
            </h2>
            <CodeBlock code={lesson.python_code} language="python" filename="lesson_solution.py" />
            {lesson.code_explanation && (
              <p className="text-xs text-steel-400 leading-relaxed font-sans">
                <MathRenderer text={lesson.code_explanation} />
              </p>
            )}
          </section>
        )}

        {lesson.common_mistakes && lesson.common_mistakes.length > 0 && (
          <Callout variant="warning" title="Common Pitfalls & Mistakes">
            <ul className="list-disc pl-4 space-y-1">
              {lesson.common_mistakes.map((m, i) => (
                <li key={i}><MathRenderer text={m} inline /></li>
              ))}
            </ul>
          </Callout>
        )}

        {lesson.related_concepts && lesson.related_concepts.length > 0 && (
          <section className="space-y-3 pt-4 border-t border-graphite-700/60">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-steel-500">
              Related Concepts
            </h2>
            <div className="flex flex-wrap gap-2">
              {lesson.related_concepts.map((cid) => (
                <Link
                  key={cid}
                  to={`/concepts/${cid}`}
                  className="px-3 py-1 bg-graphite-800 border border-graphite-700 hover:border-cyan-400 text-xs font-mono text-cyan-400 transition-colors rounded-sm"
                >
                  {cid} →
                </Link>
              ))}
            </div>
          </section>
        )}

        {lesson.knowledge_check && lesson.knowledge_check.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-graphite-700/80">
            <div className="flex items-center gap-2 text-sm font-mono text-lime-400 font-bold uppercase">
              <HelpCircle className="w-4 h-4" />
              <span>Knowledge Check</span>
            </div>

            <div className="space-y-6">
              {lesson.knowledge_check.map((q: QuizQuestion, qIdx) => {
                const selected = selectedAnswers[q.id];
                const submitted = quizSubmitted[q.id];
                const isCorrect = selected === q.correct_option_id;

                return (
                  <div key={q.id} className="p-5 border border-graphite-700 bg-graphite-800/30 rounded-sm space-y-4">
                    <div className="font-semibold text-sm sm:text-base text-bone-100">
                      <span className="font-mono text-xs text-lime-400 mr-2">Q{qIdx + 1}.</span>
                      <MathRenderer text={q.question} inline />
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt) => {
                        const isChosen = selected === opt.id;
                        let optionStyle = 'border-graphite-700 bg-graphite-800/60 hover:border-graphite-500 text-bone-100';

                        if (submitted) {
                          if (opt.id === q.correct_option_id) {
                            optionStyle = 'border-lime-400 bg-lime-400/10 text-lime-400 font-semibold';
                          } else if (isChosen && !isCorrect) {
                            optionStyle = 'border-coral-500 bg-coral-500/10 text-coral-500';
                          }
                        } else if (isChosen) {
                          optionStyle = 'border-cyan-400 bg-cyan-400/10 text-cyan-400';
                        }

                        return (
                          <button
                            key={opt.id}
                            disabled={submitted}
                            onClick={() => handleSelectQuizOption(q.id, opt.id)}
                            className={`w-full p-3 text-left text-xs sm:text-sm font-mono border transition-all flex items-center justify-between rounded-sm ${optionStyle}`}
                          >
                            <span><MathRenderer text={opt.text} inline /></span>
                            {submitted && opt.id === q.correct_option_id && (
                              <Check className="w-4 h-4 text-lime-400 shrink-0" />
                            )}
                            {submitted && isChosen && !isCorrect && (
                              <X className="w-4 h-4 text-coral-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {!submitted && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!selected}
                        onClick={() => handleVerifyQuestion(q.id)}
                      >
                        Check Answer
                      </Button>
                    )}

                    {submitted && (
                      <div className={`p-3 text-xs border rounded-sm font-sans ${isCorrect ? 'border-lime-400/40 bg-lime-400/10 text-lime-300' : 'border-coral-500/40 bg-coral-500/10 text-coral-300'}`}>
                        <div className="font-mono font-bold uppercase mb-1">
                          {isCorrect ? 'Correct!' : 'Incorrect'}
                        </div>
                        <MathRenderer text={q.explanation} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </article>

      <div className="mt-12 pt-8 border-t border-graphite-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          {isCompleted ? (
            <div className="flex items-center gap-2 text-lime-400 font-mono text-sm font-semibold">
              <CheckCircle className="w-5 h-5" />
              <span>Lesson marked as completed</span>
            </div>
          ) : (
            <span className="text-xs font-mono text-steel-500">
              Complete this lesson to log it in your progress ledger.
            </span>
          )}
        </div>

        <Button
          variant={isCompleted ? 'outline' : 'lime-solid'}
          disabled={isCompleted || marking}
          isLoading={marking}
          onClick={handleMarkComplete}
          className="w-full sm:w-auto"
        >
          {isCompleted ? 'Completed ✓' : 'Mark Lesson Complete'}
        </Button>
      </div>
    </div>
  );
}
