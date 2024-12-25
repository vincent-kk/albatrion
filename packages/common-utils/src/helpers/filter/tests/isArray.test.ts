import { describe, expect, it } from 'vitest';

import { isArray } from '../isArray';

describe('isArray', () => {
  it('should return true if the input is an array', () => {
    expect(isArray([])).toBe(true);
    expect(isArray([1, 2, 3])).toBe(true);
  });
  it('should return false if the input is not an array', () => {
    expect(isArray(0)).toBe(false);
    expect(isArray(false)).toBe(false);
    expect(isArray(null)).toBe(false);
    expect(isArray(undefined)).toBe(false);
  });
});
