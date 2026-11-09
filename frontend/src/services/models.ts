import { apiClient, normaliseApiError, fetchWithRetry } from './api';
import {
  ModelListResponse,
  ModelRecommendationCandidate,
  ModelRecommendationResponse,
} from '@/types/api';

export async function getModels(
  params?: { task_type?: string },
  signal?: AbortSignal
): Promise<ModelListResponse> {
  return fetchWithRetry(
    async (s) => {
      const res = await apiClient.get<ModelListResponse>('/models', {
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

export async function recommendModels(
  payload: {
    task_type: string;
    row_count: number;
    column_count: number;
    priority?: string;
  },
  signal?: AbortSignal
): Promise<ModelRecommendationResponse> {
  try {
    const res = await apiClient.post<ModelRecommendationResponse>('/models/recommend', payload, {
      signal,
    });
    return res.data;
  } catch (err) {
    throw normaliseApiError(err);
  }
}
