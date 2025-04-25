import { describe, expect, it } from 'vitest';

import { isMap } from '../isMap';

describe('isMap', () => {
  it('should return true for Map instances', () => {
    expect(isMap(new Map())).toBe(true);
    expect(isMap(new Map([['key', 'value']]))).toBe(true);
    expect(
      isMap(
        new Map([
          [1, 2],
          [3, 4],
        ]),
      ),
    ).toBe(true);
  });

  it('should return false for non-Map values', () => {
    expect(isMap(null)).toBe(false);
    expect(isMap(undefined)).toBe(false);
    expect(isMap(42)).toBe(false);
    expect(isMap('map')).toBe(false);
    expect(isMap({})).toBe(false);
    expect(isMap([])).toBe(false);
    expect(isMap(new Date())).toBe(false);
    expect(isMap(new Set())).toBe(false);
    expect(isMap(new WeakMap())).toBe(false);
  });

  it('should return false for objects with map-like properties', () => {
    const mapLike = {
      size: 1,
      has: () => true,
      get: () => 'value',
      set: () => true,
      delete: () => true,
      clear: () => {},
      forEach: () => {},
      entries: () => [],
      keys: () => [],
      values: () => [],
    };
    expect(isMap(mapLike)).toBe(false);
  });
});
