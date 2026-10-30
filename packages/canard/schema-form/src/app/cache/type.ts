import type { Optional } from '@aileron/declare';

import type { blueprint } from '@/schema-form/core';

/** Immutable envelope retaining the generation in which a domain value was created. */
export interface CacheDomainEntry<Value> {
  readonly value: Value;
  readonly generation: number;
}

/** Weak-key ownership boundary; invalidation never changes previously resolved values. */
export interface CacheDomain<Key extends object, Value> {
  readonly name: string;
  resolve(key: Key, build: () => Value): CacheDomainEntry<Value>;
  peek(key: Key): Optional<CacheDomainEntry<Value>>;
  invalidate(key: Key): boolean;
  clear(): void;
}

/** Core's caller-owned store, derived without importing engine internals. */
export type BlueprintCache = NonNullable<
  NonNullable<Parameters<typeof blueprint>[1]>['cache']
>;
/** Immutable list membership is maintained by replacement through the core store contract. */
export type BlueprintCacheEntries = NonNullable<
  ReturnType<BlueprintCache['get']>
>;
