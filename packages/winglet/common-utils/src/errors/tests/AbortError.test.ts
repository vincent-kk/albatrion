import { describe, expect, it } from 'vitest';

import { AbortError, isAbortError } from '../AbortError';

describe('AbortError', () => {
  it('should create an abort error with correct properties', () => {
    const message = 'Operation aborted';
    const details = { reason: 'user_cancelled' };
    const error = new AbortError('USER_CANCELLED', message, details);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AbortError);
    expect(error.message).toBe(message);
    expect(error.group).toBe('ABORT');
    expect(error.specific).toBe('USER_CANCELLED');
    expect(error.code).toBe('ABORT.USER_CANCELLED');
    expect(error.details).toEqual(details);
    expect(error.name).toBe('Abort');
  });

  it('should create an abort error with empty details when not provided', () => {
    const error = new AbortError('USER_CANCELLED', 'Operation aborted');

    expect(error.details).toEqual({});
  });
});

describe('isAbortError', () => {
  it('should return true for AbortError instances', () => {
    const error = new AbortError('USER_CANCELLED', 'Operation aborted');
    expect(isAbortError(error)).toBe(true);
  });

  it('should return false for non-AbortError instances', () => {
    const error = new Error('Regular error');
    expect(isAbortError(error)).toBe(false);

    const customError = new (class extends Error {})();
    expect(isAbortError(customError)).toBe(false);

    expect(isAbortError(null)).toBe(false);
    expect(isAbortError(undefined)).toBe(false);
    expect(isAbortError('string')).toBe(false);
    expect(isAbortError(123)).toBe(false);
    expect(isAbortError({})).toBe(false);
  });
});
