import { describe, expect, it } from 'vitest';

import { isEmptyObject } from '../isEmptyObject';

describe('isEmptyObject', () => {
  it('should return true if the input is an empty object', () => {
    expect(isEmptyObject({})).toBe(true);
  });
  it('should return false if the input is not an empty object', () => {
    expect(isEmptyObject({ a: 1 })).toBe(false);
  });
  it('should return false if the input is not an object', () => {
    expect(isEmptyObject(1)).toBe(false);
    expect(isEmptyObject('')).toBe(false);
    expect(isEmptyObject([])).toBe(false);
    expect(isEmptyObject(new Date())).toBe(false);
  });
});
