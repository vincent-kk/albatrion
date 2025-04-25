import { describe, expect, it } from 'vitest';

import { InvalidTypeError, isInvalidTypeError } from '../InvalidTypeError';

describe('InvalidTypeError', () => {
  it('should create an invalid type error with correct properties', () => {
    const message = 'Invalid type provided';
    const details = { expected: 'string', received: 'number' };
    const error = new InvalidTypeError('TYPE_MISMATCH', message, details);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(InvalidTypeError);
    expect(error.message).toBe(message);
    expect(error.group).toBe('INVALID_TYPE');
    expect(error.specific).toBe('TYPE_MISMATCH');
    expect(error.code).toBe('INVALID_TYPE.TYPE_MISMATCH');
    expect(error.details).toEqual(details);
    expect(error.name).toBe('InvalidType');
  });

  it('should create an invalid type error with empty details when not provided', () => {
    const error = new InvalidTypeError(
      'TYPE_MISMATCH',
      'Invalid type provided',
    );

    expect(error.details).toEqual({});
  });
});

describe('isInvalidTypeError', () => {
  it('should return true for InvalidTypeError instances', () => {
    const error = new InvalidTypeError(
      'TYPE_MISMATCH',
      'Invalid type provided',
    );
    expect(isInvalidTypeError(error)).toBe(true);
  });

  it('should return false for non-InvalidTypeError instances', () => {
    const error = new Error('Regular error');
    expect(isInvalidTypeError(error)).toBe(false);

    const customError = new (class extends Error {})();
    expect(isInvalidTypeError(customError)).toBe(false);

    expect(isInvalidTypeError(null)).toBe(false);
    expect(isInvalidTypeError(undefined)).toBe(false);
    expect(isInvalidTypeError('string')).toBe(false);
    expect(isInvalidTypeError(123)).toBe(false);
    expect(isInvalidTypeError({})).toBe(false);
  });
});
