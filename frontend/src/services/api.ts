import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { AppError } from '@/types/api';

const isDev = import.meta.env.DEV;
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = configuredBaseUrl || (isDev ? 'http://127.0.0.1:8000/api' : '');

if (!API_BASE_URL && !isDev) {
  console.error('[PADH LE BC] Configuration Error: VITE_API_BASE_URL environment variable is not defined.');
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  },
});

/**
 * Normalise any error into our consistent AppError shape
 */
export function normaliseApiError(error: unknown): AppError {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<any>;

    // Network / offline error
    if (!axiosErr.response) {
      if (axiosErr.code === 'ECONNABORTED') {
        return {
          code: 'TIMEOUT',
          message: 'Request timed out. The backend server took too long to respond.',
          isNetworkError: true,
        };
      }
      return {
        code: 'NETWORK_ERROR',
        message: `Unable to connect to backend at ${API_BASE_URL || 'configured API URL'}. Please verify the server is running.`,
        isNetworkError: true,
      };
    }

    const { status, data } = axiosErr.response;

    // Standard backend envelope: { error: { code, message, details } }
    if (data && typeof data === 'object' && 'error' in data) {
      return {
        code: data.error.code || `HTTP_${status}`,
        message: data.error.message || 'An unexpected error occurred.',
        details: data.error.details,
        status,
      };
    }

    // Default FastAPI 422 with { detail: [...] } if not intercepted
    if (status === 422 && data && Array.isArray(data.detail)) {
      const messages = data.detail.map((d: any) => {
        const loc = Array.isArray(d.loc) ? d.loc.filter((x: any) => x !== 'body').join(' -> ') : '';
        return loc ? `${loc}: ${d.msg}` : d.msg;
      });
      return {
        code: 'VALIDATION_ERROR',
        message: messages.join('; ') || 'Request validation failed',
        details: data.detail,
        status: 422,
      };
    }

    // Generic HTTP error with message
    return {
      code: `HTTP_${status}`,
      message: (typeof data === 'string' ? data : data?.detail) || axiosErr.message || `Server returned error status ${status}`,
      status,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'CLIENT_ERROR',
      message: error.message,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: String(error) || 'An unexpected failure occurred.',
  };
}

/**
 * Helper to execute an idempotent GET with exponential backoff retry
 */
export async function fetchWithRetry<T>(
  fn: (signal?: AbortSignal) => Promise<T>,
  retries = 2,
  delayMs = 1000,
  signal?: AbortSignal
): Promise<T> {
  try {
    return await fn(signal);
  } catch (err) {
    if (signal?.aborted) {
      throw err;
    }
    const appErr = normaliseApiError(err);
    // Don't retry client 4xx errors
    if (appErr.status && appErr.status >= 400 && appErr.status < 500) {
      throw appErr;
    }
    if (retries <= 0) {
      throw appErr;
    }
    await new Promise((res) => setTimeout(res, delayMs));
    return fetchWithRetry(fn, retries - 1, delayMs * 2, signal);
  }
}
