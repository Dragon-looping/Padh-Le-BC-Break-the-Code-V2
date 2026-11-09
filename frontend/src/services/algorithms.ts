import { apiClient, fetchWithRetry } from './api';
import { AlgorithmDetail, AlgorithmListResponse } from '@/types/api';

export async function getAlgorithms(
  params?: {
    category?: string;
    task_type?: string;
    trainable_only?: boolean;
  },
  signal?: AbortSignal
): Promise<AlgorithmListResponse> {
  return fetchWithRetry(
    async (s) => {
      const res = await apiClient.get<AlgorithmListResponse>('/algorithms', {
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

export async function getAlgorithm(
  algorithmId: string,
  signal?: AbortSignal
): Promise<AlgorithmDetail> {
  return fetchWithRetry(
    async (s) => {
      const res = await apiClient.get<AlgorithmDetail>(`/algorithms/${encodeURIComponent(algorithmId)}`, {
        signal: s,
      });
      return res.data;
    },
    2,
    800,
    signal
  );
}
