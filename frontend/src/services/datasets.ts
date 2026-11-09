import { apiClient, normaliseApiError, fetchWithRetry } from './api';
import {
  DatasetConfigureRequest,
  DatasetConfigureResponse,
  DatasetListResponse,
  DatasetProfileResponse,
  DatasetSummary,
  DatasetUploadResponse,
} from '@/types/api';

export async function uploadDataset(
  file: File,
  onUploadProgress?: (percent: number) => void,
  signal?: AbortSignal
): Promise<DatasetUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await apiClient.post<DatasetUploadResponse>('/datasets/upload', formData, {
      signal,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onUploadProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percent);
        }
      },
    });
    return res.data;
  } catch (err) {
    throw normaliseApiError(err);
  }
}

export async function getDatasets(
  params?: { skip?: number; limit?: number },
  signal?: AbortSignal
): Promise<DatasetListResponse> {
  return fetchWithRetry(
    async (s) => {
      const res = await apiClient.get<DatasetListResponse>('/datasets', {
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

export async function getDataset(
  datasetId: string,
  signal?: AbortSignal
): Promise<DatasetSummary> {
  return fetchWithRetry(
    async (s) => {
      const res = await apiClient.get<DatasetSummary>(`/datasets/${encodeURIComponent(datasetId)}`, {
        signal: s,
      });
      return res.data;
    },
    2,
    800,
    signal
  );
}

export async function getDatasetProfile(
  datasetId: string,
  signal?: AbortSignal
): Promise<DatasetProfileResponse> {
  return fetchWithRetry(
    async (s) => {
      const res = await apiClient.get<DatasetProfileResponse>(`/datasets/${encodeURIComponent(datasetId)}/profile`, {
        signal: s,
      });
      return res.data;
    },
    2,
    800,
    signal
  );
}

export async function configureDataset(
  datasetId: string,
  payload: DatasetConfigureRequest,
  signal?: AbortSignal
): Promise<DatasetConfigureResponse> {
  try {
    const res = await apiClient.post<DatasetConfigureResponse>(
      `/datasets/${encodeURIComponent(datasetId)}/configure`,
      payload,
      { signal }
    );
    return res.data;
  } catch (err) {
    throw normaliseApiError(err);
  }
}
