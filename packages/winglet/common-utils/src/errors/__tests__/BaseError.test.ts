import { describe, expect, it } from 'vitest';

import { BaseError } from '../BaseError';

class TestError extends BaseError {
  static readonly __group__ = 'TEST';
  constructor(code: string, message: string, details = {}) {
    super(TestError.__group__, code, message, details);
    this.name = 'TestError';
  }
}

describe('BaseError', () => {
  it('should create an error with correct properties', () => {
    const message = 'Test error message';
    const details = { key: 'value' };
    const error = new TestError('TEST_CODE', message, details);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(BaseError);
    expect(error.message).toBe(message);
    expect(error.group).toBe('TEST');
    expect(error.specific).toBe('TEST_CODE');
    expect(error.code).toBe('TEST.TEST_CODE');
    expect(error.details).toEqual(details);
    expect(error.name).toBe('TestError');
  });

  it('should create an error with empty details when not provided', () => {
    const error = new TestError('TEST_CODE', 'Test message');

    expect(error.details).toEqual({});
  });

  it('should maintain prototype chain', () => {
    const error = new TestError('TEST_CODE', 'Test message');

    expect(Object.getPrototypeOf(error)).toBe(TestError.prototype);
    expect(Object.getPrototypeOf(Object.getPrototypeOf(error))).toBe(
      BaseError.prototype,
    );
    expect(
      Object.getPrototypeOf(
        Object.getPrototypeOf(Object.getPrototypeOf(error)),
      ),
    ).toBe(Error.prototype);
  });
});
