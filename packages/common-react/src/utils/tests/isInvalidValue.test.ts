import { describe, expect, it } from 'vitest';

import { isInvalidValue } from '../isInvalidValue';

describe('isInvalidValue', () => {
  it('should return true for nil value', () => {
    expect(isInvalidValue(null)).toBe(true);
    expect(isInvalidValue(undefined)).toBe(true);
  });
  it('should return true for empty object', () => {
    expect(isInvalidValue({})).toBe(true);
  });
  it('should return true for empty array', () => {
    expect(isInvalidValue([])).toBe(true);
  });
  it('should return false for non-empty object', () => {
    expect(isInvalidValue({ a: 1 })).toBe(false);
  });
  it('should return false for non-empty array', () => {
    expect(isInvalidValue([1, 2, 3])).toBe(false);
  });
});
