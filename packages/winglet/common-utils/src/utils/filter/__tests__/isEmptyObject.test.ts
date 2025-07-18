import { describe, expect, it } from 'vitest';

import { isEmptyObject } from '../isEmptyObject';

describe('isEmptyObject', () => {
  it('should return true if the input is an empty object', () => {
    expect(isEmptyObject({})).toBe(true);
    expect(isEmptyObject([])).toBe(true);
  });
  it('should return false if the input is not an empty object', () => {
    expect(isEmptyObject({ a: 1 })).toBe(false);
  });
  it('should return false if the input is not an object', () => {
    expect(isEmptyObject(1)).toBe(false);
    expect(isEmptyObject('')).toBe(false);
    expect(isEmptyObject(Symbol())).toBe(false);
  });
  it('this is error case, but it will not be fixed(because of performance)', () => {
    expect(isEmptyObject(new Date())).toBe(true);
    expect(isEmptyObject(new Error())).toBe(true);
    expect(isEmptyObject(new Map())).toBe(true);
    expect(isEmptyObject(new Set())).toBe(true);
    expect(isEmptyObject(new WeakMap())).toBe(true);
    expect(isEmptyObject(new WeakSet())).toBe(true);
    expect(isEmptyObject(new Promise(() => {}))).toBe(true);
  });
});
