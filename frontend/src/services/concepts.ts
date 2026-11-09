import { apiClient, normaliseApiError, fetchWithRetry } from './api';
import { ConceptDetail, ConceptListResponse } from '@/types/api';

export async function getConcepts(
  params?: { category?: string; level?: string },
  signal?: AbortSignal
): Promise<ConceptListResponse> {
  return fetchWithRetry(
    async (s) => {
      const res = await apiClient.get<ConceptListResponse>('/concepts', {
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

export async function getConcept(
  conceptId: string,
  signal?: AbortSignal
): Promise<ConceptDetail> {
  return fetchWithRetry(
    async (s) => {
      const res = await apiClient.get<ConceptDetail>(`/concepts/${encodeURIComponent(conceptId)}`, {
        signal: s,
      });
      return res.data;
    },
    2,
    800,
    signal
  );
}
