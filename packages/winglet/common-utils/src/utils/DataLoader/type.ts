import type { Fn } from '@aileron/declare';

export type BatchLoader<Key, Value> = (
  keys: ReadonlyArray<Key>,
) => Promise<ReadonlyArray<Value | Error>>;

export type DataLoaderOptions<Key, Value, CacheKey = Key> = {
  name?: string;
  cache?: MapLike<CacheKey, Promise<Value>> | false;
  batchScheduler?: Fn<[task: Fn]>;
  cacheKeyFn?: Fn<[key: Key], CacheKey>;
} & (
  | {
      maxBatchSize?: number;
    }
  | {
      disableBatch: true;
    }
);

export type MapLike<Key, Value> = {
  get(key: Key): Value | undefined;
  set(key: Key, value: Value): any;
  delete(key: Key): any;
  clear(): any;
};

export type Batch<Key, Value> = {
  isResolved: boolean;
  keys: Array<Key>;
  promises: Array<{
    resolve: Fn<[value: Value]>;
    reject: Fn<[error: Error]>;
  }>;
  cacheHits?: Array<Fn>;
};
