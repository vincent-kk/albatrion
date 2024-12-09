import { describe, expect, it } from 'vitest';

import { isEmptyArray } from '../isEmptyArray';

describe('isEmptyArray', () => {
  it('should return true if the input is an empty array', () => {
    expect(isEmptyArray([])).toBe(true);
  });
  it('should return false if the input is not an empty array', () => {
    expect(isEmptyArray([1, 2, 3])).toBe(false);
  });
  it('should return false if the input is not an array', () => {
    expect(isEmptyArray(1)).toBe(false);
    expect(isEmptyArray('')).toBe(false);
    expect(isEmptyArray({})).toBe(false);
  });
});
