import { describe, expect, it } from 'vitest';

import { mapCacheFactory, weakMapCacheFactory } from '../cache';

describe('weakMapCacheFactory', () => {
  it('should create a new WeakMap cache with default value', () => {
    const cache = weakMapCacheFactory();
    expect(cache.raw).toBeInstanceOf(WeakMap);
  });

  it('should use provided WeakMap as cache', () => {
    const weakMap = new WeakMap();
    const cache = weakMapCacheFactory(weakMap);
    expect(cache.raw).toBe(weakMap);
  });

  it('should handle basic WeakMap operations', () => {
    const cache = weakMapCacheFactory();
    const key = {};
    const value = 'test';

    expect(cache.has(key)).toBe(false);
    cache.set(key, value);
    expect(cache.has(key)).toBe(true);
    expect(cache.get(key)).toBe(value);
    expect(cache.delete(key)).toBe(true);
    expect(cache.has(key)).toBe(false);
  });
});

describe('mapCacheFactory', () => {
  it('should create a new Map cache with default value', () => {
    const cache = mapCacheFactory();
    expect(cache.raw).toBeInstanceOf(Map);
  });

  it('should use provided Map as cache', () => {
    const map = new Map();
    const cache = mapCacheFactory(map);
    expect(cache.raw).toBe(map);
  });

  it('should handle basic Map operations', () => {
    const cache = mapCacheFactory();
    const key = 'test';
    const value = 'value';

    expect(cache.has(key)).toBe(false);
    cache.set(key, value);
    expect(cache.has(key)).toBe(true);
    expect(cache.get(key)).toBe(value);
    expect(cache.delete(key)).toBe(true);
    expect(cache.has(key)).toBe(false);
  });

  it('should handle size, keys, values, and entries operations', () => {
    const cache = mapCacheFactory();
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');

    expect(cache.size()).toBe(2);
    expect(Array.from(cache.keys())).toEqual(['key1', 'key2']);
    expect(Array.from(cache.values())).toEqual(['value1', 'value2']);
    expect(Array.from(cache.entries())).toEqual([
      ['key1', 'value1'],
      ['key2', 'value2'],
    ]);

    cache.clear();
    expect(cache.size()).toBe(0);
  });
});
