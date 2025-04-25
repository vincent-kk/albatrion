import { describe, expect, it } from 'vitest';

import { isError } from '../isError';

describe('isError', () => {
  it('should return true for Error instances', () => {
    expect(isError(new Error())).toBe(true);
    expect(isError(new TypeError())).toBe(true);
    expect(isError(new ReferenceError())).toBe(true);
    expect(isError(new SyntaxError())).toBe(true);
    expect(isError(new RangeError())).toBe(true);
    expect(isError(new URIError())).toBe(true);
    expect(isError(new EvalError())).toBe(true);
  });

  it('should return true for custom Error classes', () => {
    class CustomError extends Error {}
    expect(isError(new CustomError())).toBe(true);
  });

  it('should return false for non-Error values', () => {
    expect(isError(null)).toBe(false);
    expect(isError(undefined)).toBe(false);
    expect(isError(42)).toBe(false);
    expect(isError('error')).toBe(false);
    expect(isError({})).toBe(false);
    expect(isError([])).toBe(false);
    expect(isError(new Date())).toBe(false);
    expect(isError(new RegExp('test'))).toBe(false);
  });

  it('should return false for objects with error-like properties', () => {
    const errorLike = {
      name: 'Error',
      message: 'Something went wrong',
      stack: 'Error: Something went wrong\n    at line 1',
    };
    expect(isError(errorLike)).toBe(false);
  });
});
