import { apiClient, fetchWithRetry } from './api';
import { LessonDetail, LessonListResponse } from '@/types/api';

export async function getLessons(
  params?: { unit?: string },
  signal?: AbortSignal
): Promise<LessonListResponse> {
  return fetchWithRetry(
    async (s) => {
      const res = await apiClient.get<LessonListResponse>('/lessons', {
        params,
        signal: s,
      });
      return res.data;
    },
    2,
    800,
    signal
  );
}

export async function getLesson(
  lessonId: string,
  signal?: AbortSignal
): Promise<LessonDetail> {
  return fetchWithRetry(
    async (s) => {
      const res = await apiClient.get<LessonDetail>(`/lessons/${encodeURIComponent(lessonId)}`, {
        signal: s,
      });
      return res.data;
    },
    2,
    800,
    signal
  );
}
