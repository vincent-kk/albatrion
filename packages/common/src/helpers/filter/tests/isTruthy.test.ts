import { describe, expect, it } from 'vitest';

import { isTruthy } from '../isTruthy';

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
