import { apiClient, normaliseApiError, fetchWithRetry } from './api';
import {
  ExperimentCreateRequest,
  ExperimentListResponse,
  ExperimentReportResponse,
  ExperimentResponse,
  ExperimentTuneRequest,
  ExperimentTuneResponse,
} from '@/types/api';

export async function createExperiment(
  payload: ExperimentCreateRequest,
  signal?: AbortSignal
): Promise<ExperimentResponse> {
  // Never auto-retry POST /experiments
  try {
    const res = await apiClient.post<ExperimentResponse>('/experiments', payload, {
      signal,
    });
    return res.data;
  } catch (err) {
    throw normaliseApiError(err);
  }
}

export async function getExperiments(
  params?: { skip?: number; limit?: number },
  signal?: AbortSignal
): Promise<ExperimentListResponse> {
  return fetchWithRetry(
    async (s) => {
      const res = await apiClient.get<ExperimentListResponse>('/experiments', {
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

export async function getExperiment(
  experimentId: string,
  signal?: AbortSignal
): Promise<ExperimentResponse> {
  return fetchWithRetry(
    async (s) => {
      const res = await apiClient.get<ExperimentResponse>(`/experiments/${encodeURIComponent(experimentId)}`, {
        signal: s,
      });
      return res.data;
    },
    2,
    800,
    signal
  );
}

export async function getExperimentReport(
  experimentId: string,
  signal?: AbortSignal
): Promise<ExperimentReportResponse> {
  return fetchWithRetry(
    async (s) => {
      const res = await apiClient.get<ExperimentReportResponse>(`/experiments/${encodeURIComponent(experimentId)}/report`, {
        signal: s,
      });
      return res.data;
    },
    2,
    800,
    signal
  );
}

export async function tuneExperimentModel(
  experimentId: string,
  payload: ExperimentTuneRequest,
  signal?: AbortSignal
): Promise<ExperimentTuneResponse> {
  try {
    const res = await apiClient.post<ExperimentTuneResponse>(
      `/experiments/${encodeURIComponent(experimentId)}/tune`,
      payload,
      { signal }
    );
    return res.data;
  } catch (err) {
    throw normaliseApiError(err);
  }
}
