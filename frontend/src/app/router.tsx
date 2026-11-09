import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';

// Lazy-loaded pages as specified in Section 8
const HomePage = lazy(() => import('@/pages/HomePage/HomePage').then((m) => ({ default: m.HomePage })));
const LearningHubPage = lazy(() => import('@/pages/LearningHubPage/LearningHubPage').then((m) => ({ default: m.LearningHubPage })));
const LessonPage = lazy(() => import('@/pages/LessonPage/LessonPage').then((m) => ({ default: m.LessonPage })));
const ConceptPage = lazy(() => import('@/pages/ConceptPage/ConceptPage').then((m) => ({ default: m.ConceptPage })));
const AlgorithmLibraryPage = lazy(() => import('@/pages/AlgorithmLibraryPage/AlgorithmLibraryPage').then((m) => ({ default: m.AlgorithmLibraryPage })));
const AlgorithmDetailPage = lazy(() => import('@/pages/AlgorithmDetailPage/AlgorithmDetailPage').then((m) => ({ default: m.AlgorithmDetailPage })));
const PlaygroundPage = lazy(() => import('@/pages/PlaygroundPage/PlaygroundPage').then((m) => ({ default: m.PlaygroundPage })));
const ModelLabPage = lazy(() => import('@/pages/ModelLabPage/ModelLabPage').then((m) => ({ default: m.ModelLabPage })));
const DatasetProfilePage = lazy(() => import('@/pages/DatasetProfilePage/DatasetProfilePage').then((m) => ({ default: m.DatasetProfilePage })));
const ExperimentResultsPage = lazy(() => import('@/pages/ExperimentResultsPage/ExperimentResultsPage').then((m) => ({ default: m.ExperimentResultsPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

function RouteFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center font-mono text-xs text-steel-500 animate-pulse">
      Loading view coordinates...
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<RouteFallback />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'learn',
        element: (
          <Suspense fallback={<RouteFallback />}>
            <LearningHubPage />
          </Suspense>
        ),
      },
      {
        path: 'learn/:lessonId',
        element: (
          <Suspense fallback={<RouteFallback />}>
            <LessonPage />
          </Suspense>
        ),
      },
      {
        path: 'concepts/:conceptId',
        element: (
          <Suspense fallback={<RouteFallback />}>
            <ConceptPage />
          </Suspense>
        ),
      },
      {
        path: 'algorithms',
        element: (
          <Suspense fallback={<RouteFallback />}>
            <AlgorithmLibraryPage />
          </Suspense>
        ),
      },
      {
        path: 'algorithms/:algorithmId',
        element: (
          <Suspense fallback={<RouteFallback />}>
            <AlgorithmDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'playground',
        element: (
          <Suspense fallback={<RouteFallback />}>
            <PlaygroundPage />
          </Suspense>
        ),
      },
      {
        path: 'playground/:algorithmId',
        element: (
          <Suspense fallback={<RouteFallback />}>
            <PlaygroundPage />
          </Suspense>
        ),
      },
      {
        path: 'model-lab',
        element: (
          <Suspense fallback={<RouteFallback />}>
            <ModelLabPage />
          </Suspense>
        ),
      },
      {
        path: 'datasets/:datasetId',
        element: (
          <Suspense fallback={<RouteFallback />}>
            <DatasetProfilePage />
          </Suspense>
        ),
      },
      {
        path: 'experiments/:experimentId',
        element: (
          <Suspense fallback={<RouteFallback />}>
            <ExperimentResultsPage />
          </Suspense>
        ),
      },
      {
        path: 'projects',
        element: <Navigate to="/model-lab" replace />,
      },
      {
        path: 'progress',
        element: <Navigate to="/model-lab" replace />,
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<RouteFallback />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },
]);
