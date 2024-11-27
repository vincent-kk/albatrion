import { describe, expect, it } from 'vitest';

import { isFunction, isTruthy } from './common';

describe('isTruthy', () => {
  it('should return true if the input is truthy', () => {
    expect(isTruthy(1)).toBe(true);
  });
  it('should return false if the input is falsy', () => {
    expect(isTruthy(0)).toBe(false);
    expect(isTruthy(false)).toBe(false);
    expect(isTruthy(null)).toBe(false);
    expect(isTruthy(undefined)).toBe(false);
  });
});

describe('isFunction', () => {
  it('should return true if the input is a function', () => {
    expect(isFunction(() => {})).toBe(true);
  });
  it('should return false if the input is not a function', () => {
    expect(isFunction(1)).toBe(false);
    expect(isFunction({})).toBe(false);
    expect(isFunction([])).toBe(false);
  });
});
