import type { Dataloader } from '../Dataloader';
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
  dataloader: Dataloader<any, any>,
  batch: Batch<any, any>,
  error: E,
) => {
  resolveCacheHits(batch);
  for (let i = 0; i < batch.keys.length; i++) {
    dataloader.clear(batch.keys[i]);
    batch.promises[i].reject(error);
  }
};
