import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, Search, ArrowRight, Sparkles } from 'lucide-react';
import { getLessons } from '@/services/lessons';
import { getProgress } from '@/services/progress';
import { LessonListResponse, LearnerProgressResponse } from '@/types/api';
import { ConnectionError } from '@/components/feedback/ConnectionError';
import { EmptyState } from '@/components/feedback/EmptyState';
import { SkeletonCard } from '@/components/feedback/Skeletons';

export function LearningHubPage() {
  const [lessonsData, setLessonsData] = useState<LessonListResponse | null>(null);
  const [progressData, setProgressData] = useState<LearnerProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const [lessons, progress] = await Promise.all([
        getLessons(undefined, signal),
        getProgress(undefined, signal).catch(() => null),
      ]);
      setLessonsData(lessons);
      setProgressData(progress);
    } catch (err: any) {
      if (!signal?.aborted) {
        setError(err.message || 'Failed to load curriculum.');
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
  }, []);

  const completedSet = new Set(progressData?.completed_lessons || []);

  // Filter lessons based on client-side search query
  const filteredUnits = lessonsData?.units.map((unit) => {
    const matchedLessons = unit.lessons.filter((l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.module.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...unit, lessons: matchedLessons };
  }).filter((u) => u.lessons.length > 0) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Editorial Header with Lime Accent */}
      <div className="border-b border-graphite-700/80 pb-8 mb-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 text-xs font-mono border border-lime-400/40 bg-lime-400/10 text-lime-400 mb-4 rounded-sm">
          <BookOpen className="w-3.5 h-3.5" />
          <span>CURRICULUM · UNITS 1 TO 5</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-bone-100">
          Learning <span className="text-lime-400">Hub</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-steel-400 max-w-2xl leading-relaxed">
          Master machine learning from foundational math to hyperparameter tuning. Each lesson pairs intuitive conceptual explanations with scikit-learn code.
        </p>

        {/* Progress summary banner if available */}
        {progressData && progressData.total_completed > 0 && (
          <div className="mt-6 p-4 border border-lime-400/30 bg-lime-400/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-lime-400" />
              <div className="text-sm">
                <span className="font-semibold text-bone-100">{progressData.total_completed}</span> of{' '}
                <span className="font-semibold text-bone-100">{lessonsData?.total_lessons || 11}</span> lessons completed
              </div>
            </div>
            <span className="text-xs font-mono text-lime-400 font-medium">
              Active Session
            </span>
          </div>
        )}

        {/* Client-side Search */}
        <div className="mt-8 relative max-w-md">
          <label htmlFor="curriculum-search" className="sr-only">
            Search curriculum lessons
          </label>
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-steel-500 pointer-events-none" />
          <input
            id="curriculum-search"
            type="search"
            placeholder="Search lessons (e.g. Ridge, K-Means, Confusion Matrix)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-ink-900 border border-graphite-700 text-bone-100 text-sm placeholder:text-steel-500 focus-visible:outline-2 focus-visible:outline-lime-400 rounded-sm font-mono"
          />
        </div>
      </div>

      {/* State Rendering */}
      {loading ? (
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <ConnectionError
          requestName="GET /api/lessons"
          message={error}
          onRetry={() => loadData()}
        />
      ) : filteredUnits.length === 0 ? (
        <EmptyState
          title="No Lessons Found"
          description={
            searchQuery
              ? `No lessons match the query "${searchQuery}".`
              : 'Curriculum content has not been published yet.'
          }
          icon="search"
          actionText={searchQuery ? 'Clear Search' : undefined}
          onAction={() => setSearchQuery('')}
        />
      ) : (
        <div className="space-y-12">
          {filteredUnits.map((unit) => (
            <section key={unit.unit} className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-graphite-700/60 pb-2">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xl sm:text-2xl font-black text-lime-400">
                    {unit.unit}
                  </span>
                  <h2 className="text-lg sm:text-xl font-display font-bold text-bone-100">
                    {unit.module_title}
                  </h2>
                </div>
                <span className="text-xs font-mono text-steel-500">
                  {unit.lessons.length} {unit.lessons.length === 1 ? 'lesson' : 'lessons'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unit.lessons.map((lesson) => {
                  const isDone = completedSet.has(lesson.id);
                  return (
                    <Link
                      key={lesson.id}
                      to={`/learn/${lesson.id}`}
                      className="group p-5 border border-graphite-700 bg-graphite-800/30 hover:border-lime-400 hover:bg-graphite-800/60 transition-all flex flex-col justify-between rounded-sm"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-steel-500 uppercase tracking-wider">
                            Lesson {lesson.order}
                          </span>
                          <span className="flex items-center gap-1.5 text-steel-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{lesson.estimated_minutes}m</span>
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-bone-100 group-hover:text-lime-400 transition-colors">
                          {lesson.title}
                        </h3>
                      </div>

                      <div className="pt-4 flex items-center justify-between text-xs font-mono">
                        <span className="px-2 py-0.5 border border-graphite-700 text-steel-400 bg-ink-950 uppercase text-[10px]">
                          {lesson.level}
                        </span>
                        <div className="flex items-center gap-1 text-steel-400 group-hover:text-lime-400 transition-colors">
                          {isDone ? (
                            <span className="flex items-center gap-1 text-lime-400">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <>
                              <span>Start Lesson</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
