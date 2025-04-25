import { describe, expect, it } from 'vitest';

import { TimeoutError, isTimeoutError } from '../TimeoutError';

describe('TimeoutError', () => {
  it('should create a timeout error with correct properties', () => {
    const message = 'Operation timed out';
    const details = { timeout: 5000 };
    const error = new TimeoutError('OPERATION_TIMEOUT', message, details);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(TimeoutError);
    expect(error.message).toBe(message);
    expect(error.group).toBe('TIMEOUT');
    expect(error.specific).toBe('OPERATION_TIMEOUT');
    expect(error.code).toBe('TIMEOUT.OPERATION_TIMEOUT');
    expect(error.details).toEqual(details);
    expect(error.name).toBe('Timeout');
  });

  it('should create a timeout error with empty details when not provided', () => {
    const error = new TimeoutError('OPERATION_TIMEOUT', 'Operation timed out');

    expect(error.details).toEqual({});
  });
});

describe('isTimeoutError', () => {
  it('should return true for TimeoutError instances', () => {
    const error = new TimeoutError('OPERATION_TIMEOUT', 'Operation timed out');
    expect(isTimeoutError(error)).toBe(true);
  });

  it('should return false for non-TimeoutError instances', () => {
    const error = new Error('Regular error');
    expect(isTimeoutError(error)).toBe(false);

    const customError = new (class extends Error {})();
    expect(isTimeoutError(customError)).toBe(false);

    expect(isTimeoutError(null)).toBe(false);
    expect(isTimeoutError(undefined)).toBe(false);
    expect(isTimeoutError('string')).toBe(false);
    expect(isTimeoutError(123)).toBe(false);
    expect(isTimeoutError({})).toBe(false);
  });
});
