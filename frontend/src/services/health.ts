import { apiClient, normaliseApiError } from './api';
import { HealthResponse } from '@/types/api';

export async function checkHealth(signal?: AbortSignal): Promise<HealthResponse> {
  try {
    const res = await apiClient.get<HealthResponse>('/health', { signal });
    return res.data;
  } catch (err) {
    throw normaliseApiError(err);
  }
}
