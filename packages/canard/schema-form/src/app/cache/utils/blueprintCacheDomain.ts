import type { BlueprintCacheEntries } from '../type';
import { BlueprintCacheStore } from './BlueprintCacheStore';
import { createCacheDomain } from './createCacheDomain';

/** One process-lifetime weak schema domain; predicate variants are owned by core's cache contract. */
const domain = createCacheDomain<object, BlueprintCacheEntries>('blueprint');

/** Binding-owned store and explicit schema invalidation; never exported from the package surface. */
export const blueprintCacheDomain = {
  cache: new BlueprintCacheStore(domain),
  invalidate: (schema: object) => domain.invalidate(schema),
};
