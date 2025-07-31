import type { DataLoader } from '../DataLoader';
import type { Batch } from '../type';

export const createBatch = <K, V>(): Batch<K, V> => ({
  isResolved: false,
  keys: [],
  promises: [],
  cacheHits: [],
});

export const resolveCacheHits = <Key, Value>(batch: Batch<Key, Value>) => {
  if (!batch.cacheHits) return;
  for (const resolveCacheHit of batch.cacheHits) resolveCacheHit();
};

export const failedDispatch = <E extends Error>(
  loader: DataLoader<any, any>,
  batch: Batch<any, any>,
  error: E,
) => {
  resolveCacheHits(batch);
  for (let i = 0, l = batch.keys.length; i < l; i++) {
    loader.clear(batch.keys[i]);
    batch.promises[i].reject(error);
  }
};
