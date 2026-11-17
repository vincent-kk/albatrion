import type { DataLoader } from '../DataLoader';
import type { Batch } from '../type';

export const createBatch = <K, V>(): Batch<K, V> => ({
  isResolved: false,
  keys: [],
  promises: [],
  cacheHits: [],
});

/**
 * Appends a key to the batch and registers the pending promise that the batch settles.
 * Mutating the batch is the stated purpose: the key and its resolvers stay index-aligned.
 * @param batch - The open batch that receives the key
 * @param key - The loader key to request when the batch is dispatched
 * @returns The promise settled with the value at the key's index in the batch result
 */
export const enqueueKey = <Key, Value>(
  batch: Batch<Key, Value>,
  key: Key,
): Promise<Value> => {
  batch.keys.push(key);
  return new Promise<Value>((resolve, reject) =>
    batch.promises.push({ resolve, reject }),
  );
};

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
