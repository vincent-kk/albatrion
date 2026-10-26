import { afterEach, expect, it, vi } from 'vitest';

import { CacheManager } from '../utils/CacheManager';
import { createCacheDomain } from '../utils/createCacheDomain';

afterEach(() => CacheManager.reset());

it('resolves one stable value and generation for the same object key', () => {
  const domain = createCacheDomain<object, { total: number }>('test-identity');
  const key = {};
  const build = vi.fn(() => ({ total: 1 }));
  const first = domain.resolve(key, build);
  expect(domain.resolve(key, build)).toBe(first);
  expect(first.value).toEqual({ total: 1 });
  expect(build).toHaveBeenCalledTimes(1);
  expect(domain.resolve({}, build)).not.toBe(first);
});

it('invalidates a key without altering a previously returned entry', () => {
  const domain = createCacheDomain<object, object>('test-invalidate');
  const key = {};
  const first = domain.resolve(key, () => ({ old: true }));
  expect(domain.invalidate(key)).toBe(true);
  expect(domain.peek(key)).toBeUndefined();
  expect(domain.resolve(key, () => ({}))).not.toBe(first);
  expect(first.value).toEqual({ old: true });
});

it('clears registered domains and advances the creation generation', () => {
  const domain = createCacheDomain<object, object>('test-reset');
  const key = {};
  const first = domain.resolve(key, () => ({}));
  CacheManager.reset();
  const next = domain.resolve(key, () => ({}));
  expect(next).not.toBe(first);
  expect(next.generation).toBeGreaterThan(first.generation);
});

it('freezes the entry and value in development without freezing its key', () => {
  const domain = createCacheDomain<object, { mutable: number }>('test-freeze');
  const key = {};
  const entry = domain.resolve(key, () => ({ mutable: 1 }));
  expect(Object.isFrozen(entry)).toBe(true);
  expect(Object.isFrozen(entry.value)).toBe(true);
  expect(Object.isFrozen(key)).toBe(false);
});
