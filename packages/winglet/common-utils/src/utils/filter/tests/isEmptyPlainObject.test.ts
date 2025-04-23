import { describe, expect, it } from 'vitest';

import { isEmptyPlainObject } from '../isEmptyPlainObject';

describe('isEmptyPlainObject', () => {
  it('should return true if the input is an empty object', () => {
    expect(isEmptyPlainObject({})).toBe(true);
  });
  it('should return false if the input is not an empty object', () => {
    expect(isEmptyPlainObject({ a: 1 })).toBe(false);
  });
  it('should return false if the input is not an object', () => {
    expect(isEmptyPlainObject(1)).toBe(false);
    expect(isEmptyPlainObject('')).toBe(false);
    expect(isEmptyPlainObject([])).toBe(false);
    expect(isEmptyPlainObject(new Date())).toBe(false);
  });
  it('this is safe version of isEmptyObject, but little bit slower', () => {
    expect(isEmptyPlainObject(new Date())).toBe(false);
    expect(isEmptyPlainObject(new Error())).toBe(false);
    expect(isEmptyPlainObject(new Map())).toBe(false);
    expect(isEmptyPlainObject(new Set())).toBe(false);
    expect(isEmptyPlainObject(new WeakMap())).toBe(false);
    expect(isEmptyPlainObject(new WeakSet())).toBe(false);
    expect(isEmptyPlainObject(new Promise(() => {}))).toBe(false);
  });
});
