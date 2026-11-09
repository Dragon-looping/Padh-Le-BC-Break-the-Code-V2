import { apiClient, normaliseApiError, fetchWithRetry } from './api';
import { LearnerProgressResponse, LessonCompleteResponse } from '@/types/api';

const SESSION_STORAGE_KEY = 'padh_le_bc_session_id';

export function getLocalSessionId(): string {
  try {
    let sid = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sid) {
      sid = 'learner_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem(SESSION_STORAGE_KEY, sid);
    }
    return sid;
  } catch {
    return 'default_learner';
  }
}

export async function getProgress(
  sessionId?: string,
  signal?: AbortSignal
): Promise<LearnerProgressResponse> {
  const sid = sessionId || getLocalSessionId();
  return fetchWithRetry(
    async (s) => {
      const res = await apiClient.get<LearnerProgressResponse>('/progress', {
        params: { session_id: sid },
        signal: s,
      });
      return res.data;
    },
    2,
    800,
    signal
  );
}

export async function completeLesson(
  lessonId: string,
  sessionId?: string,
  signal?: AbortSignal
): Promise<LessonCompleteResponse> {
  const sid = sessionId || getLocalSessionId();
  try {
    const res = await apiClient.post<LessonCompleteResponse>(
      `/progress/lessons/${encodeURIComponent(lessonId)}/complete`,
      { session_id: sid },
      { signal }
    );
    return res.data;
  } catch (err) {
    throw normaliseApiError(err);
  }
}
