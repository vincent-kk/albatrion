import { describe, expect, it } from 'vitest';

import { isPlainObject } from '../isPlainObject';

describe('isPlainObject', () => {
  it('should return true if the input is a plain object', () => {
    expect(isPlainObject({})).toBe(true);
  });
  it('should return false if the input is not a plain object', () => {
    expect(isPlainObject(1)).toBe(false);
    expect(isPlainObject('')).toBe(false);
    expect(isPlainObject([])).toBe(false);
  });
  it('should return false if the input is an object with a non-plain prototype', () => {
    expect(isPlainObject(Object.create(null))).toBe(false);
  });
});
