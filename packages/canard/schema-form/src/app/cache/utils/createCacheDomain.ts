import type { CacheDomain, CacheDomainEntry } from '../type';
import { CacheManager } from './CacheManager';

/** Create and register a weak-key domain; values and envelopes are shallow-frozen in development. */
export function createCacheDomain<Key extends object, Value>(
  name: string,
): CacheDomain<Key, Value> {
  let entries = new WeakMap<Key, CacheDomainEntry<Value>>();
  let generation = 0;
  const domain: CacheDomain<Key, Value> = {
    name,
    resolve(key, build) {
      const existing = entries.get(key);
      if (existing) return existing;
      const value = build();
      const entry = { value, generation };
      if (process.env.NODE_ENV !== 'production') {
        Object.freeze(value);
        Object.freeze(entry);
      }
      entries.set(key, entry);
      return entry;
    },
    peek: (key) => entries.get(key),
    invalidate: (key) => entries.delete(key),
    clear() {
      entries = new WeakMap();
      generation++;
    },
  };
  CacheManager.register(domain);
  return domain;
}
