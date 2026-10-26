import { afterEach, expect, it, vi } from 'vitest';

import { blueprint } from '@/schema-form/core';

import { CacheManager } from '../utils/CacheManager';
import { blueprintCacheDomain } from '../utils/blueprintCacheDomain';

afterEach(() => CacheManager.reset());

it('shares only schema and renderer predicate identities', () => {
  const schema = { type: 'object', properties: { value: { type: 'string' } } };
  const cache = blueprintCacheDomain.cache;
  const isTerminal = () => undefined;
  const first = blueprint(schema, { cache, isTerminal });
  expect(blueprint(schema, { cache, isTerminal })).toBe(first);
  expect(blueprint({ ...schema }, { cache, isTerminal })).not.toBe(first);
  expect(blueprint(schema, { cache, isTerminal: () => undefined })).not.toBe(first);
  expect(blueprint(schema, { cache, isTerminal, isAtomic: () => false })).not.toBe(first);
});

it('replays preserved diagnostics once for each collector identity', () => {
  const schema = { type: 'object', dependentSchemas: {} };
  const cache = blueprintCacheDomain.cache;
  const first = blueprint(schema, { cache });
  const collect = vi.fn();
  const other = vi.fn();
  expect(blueprint(schema, { cache, collect })).toBe(first);
  expect(blueprint(schema, { cache, collect })).toBe(first);
  expect(blueprint(schema, { cache, collect: other })).toBe(first);
  expect(collect).toHaveBeenCalledTimes(1);
  expect(other.mock.calls).toEqual(collect.mock.calls);
});

it('invalidates subsequent resolutions without altering live blueprints', () => {
  const schema = { type: 'object' };
  const first = blueprint(schema, { cache: blueprintCacheDomain.cache });
  blueprintCacheDomain.invalidate(schema);
  const next = blueprint(schema, { cache: blueprintCacheDomain.cache });
  expect(next).not.toBe(first);
  expect(first.root.kind).toBe('object');
  CacheManager.reset();
  expect(blueprint(schema, { cache: blueprintCacheDomain.cache })).not.toBe(next);
});
