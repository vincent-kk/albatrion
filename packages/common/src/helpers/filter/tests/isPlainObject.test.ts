import { describe, expect, it } from 'vitest';

import { isPlainObject } from '../isPlainObject';

describe('isPlainObject', () => {
  it('should return true if the input is a plain object', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject(Object.create(null))).toBe(true);
  });
  it('should return false if the input is not a plain object', () => {
    expect(isPlainObject(1)).toBe(false);
    expect(isPlainObject('')).toBe(false);
    expect(isPlainObject([])).toBe(false);
  });
});
