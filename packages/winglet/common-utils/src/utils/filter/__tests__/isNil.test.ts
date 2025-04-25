import { describe, expect, it } from 'vitest';

import { isNil } from '../isNil';

describe('isNil', () => {
  it('should return true for null and undefined values', () => {
    expect(isNil(null)).toBe(true);
    expect(isNil(undefined)).toBe(true);
  });

  it('should return false for non-nil values', () => {
    expect(isNil(0)).toBe(false);
    expect(isNil('')).toBe(false);
    expect(isNil(false)).toBe(false);
    expect(isNil({})).toBe(false);
    expect(isNil([])).toBe(false);
    expect(isNil(new Date())).toBe(false);
    expect(isNil(new RegExp('test'))).toBe(false);
    expect(isNil(new Error())).toBe(false);
    expect(isNil(new Map())).toBe(false);
    expect(isNil(new Set())).toBe(false);
    expect(isNil(new WeakMap())).toBe(false);
    expect(isNil(new WeakSet())).toBe(false);
    expect(isNil(new ArrayBuffer(8))).toBe(false);
    expect(isNil(new DataView(new ArrayBuffer(8)))).toBe(false);
    expect(isNil(new Blob())).toBe(false);
    expect(isNil(new File([], 'test.txt'))).toBe(false);
  });
});
