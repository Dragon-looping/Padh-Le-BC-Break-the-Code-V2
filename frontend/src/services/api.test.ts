import { describe, it, expect } from 'vitest';
import { normaliseApiError } from './api';

describe('normaliseApiError', () => {
  it('normalises standard backend AppException envelope', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          error: {
            code: 'INVALID_TARGET_COLUMN',
            message: 'Target column does not exist in dataset.',
          },
        },
      },
    };

    const normalised = normaliseApiError(error);
    expect(normalised.code).toBe('INVALID_TARGET_COLUMN');
    expect(normalised.message).toBe('Target column does not exist in dataset.');
    expect(normalised.status).toBe(400);
  });

  it('normalises FastAPI 422 validation detail array', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 422,
        data: {
          detail: [
            { loc: ['body', 'test_size'], msg: 'Input should be greater than or equal to 0.05' },
          ],
        },
      },
    };

    const normalised = normaliseApiError(error);
    expect(normalised.code).toBe('VALIDATION_ERROR');
    expect(normalised.message).toContain('test_size: Input should be greater than or equal to 0.05');
    expect(normalised.status).toBe(422);
  });

  it('handles offline / network disconnect', () => {
    const error = {
      isAxiosError: true,
      response: undefined,
      message: 'Network Error',
    };

    const normalised = normaliseApiError(error);
    expect(normalised.isNetworkError).toBe(true);
    expect(normalised.code).toBe('NETWORK_ERROR');
    expect(normalised.message).toContain('Unable to connect to backend');
  });

  it('handles request timeout error', () => {
    const error = {
      isAxiosError: true,
      code: 'ECONNABORTED',
      response: undefined,
    };

    const normalised = normaliseApiError(error);
    expect(normalised.code).toBe('TIMEOUT');
    expect(normalised.isNetworkError).toBe(true);
  });
});
