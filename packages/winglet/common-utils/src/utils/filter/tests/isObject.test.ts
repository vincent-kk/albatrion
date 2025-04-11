import { describe, expect, it } from 'vitest';

import { isObject } from '../isObject';

describe('isObject', () => {
  it('should return true for objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
    expect(isObject(new Object())).toBe(true);
    expect(isObject(Object.create(null))).toBe(true);
  });

  it('should return false for null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('should return false for primitive values', () => {
    expect(isObject(undefined)).toBe(false);
    expect(isObject(42)).toBe(false);
    expect(isObject('string')).toBe(false);
    expect(isObject(true)).toBe(false);
    expect(isObject(Symbol('test'))).toBe(false);
  });

  it('should return true for arrays', () => {
    expect(isObject([])).toBe(true);
    expect(isObject([1, 2, 3])).toBe(true);
  });

  it('should return false for functions', () => {
    expect(isObject(() => {})).toBe(false);
    expect(isObject(function () {})).toBe(false);
  });

  it('should return true for other object types', () => {
    expect(isObject(new Date())).toBe(true);
    expect(isObject(new RegExp('test'))).toBe(true);
    expect(isObject(new Map())).toBe(true);
    expect(isObject(new Set())).toBe(true);
  });
});
