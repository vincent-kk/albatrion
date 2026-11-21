import { IDENTITY_FUNCTION } from '@winglet/common-utils/constant';
import { isFunction } from '@winglet/common-utils/filter';
import { scheduleNextTick } from '@winglet/common-utils/scheduler';

import type { Fn } from '@aileron/declare';

import type { BatchLoader, MapLike } from '../type';
import { DataLoaderError } from './error';

export const prepareBatchLoader = <Key, Value>(
  batchLoader: BatchLoader<Key, Value>,
): BatchLoader<Key, Value> => {
  if (!isFunction(batchLoader))
    throw new DataLoaderError(
      'INVALID_BATCH_LOADER',
      `DataLoader > batchLoader must be a function: ${batchLoader}`,
      { batchLoader },
    );
  return batchLoader;
};

export const prepareBatchScheduler = (
  batchScheduler?: Fn<[task: Fn]>,
): Fn<[task: Fn]> => {
  if (batchScheduler === undefined) return scheduleNextTick;
  if (!isFunction(batchScheduler))
    throw new DataLoaderError(
      'INVALID_BATCH_SCHEDULER',
      `DataLoaderOptions > batchScheduler must be a function: ${batchScheduler}`,
      { batchScheduler },
    );
  return batchScheduler;
};

/**
 * Validates the constructor batch limit after honoring disableBatch.
 * @param options - Optional positive integral limit or the unlimited Infinity sentinel
 * @returns One when batching is disabled, otherwise the validated limit
 * @throws DataLoaderError when an active limit is neither Infinity nor a positive integer
 */
export const prepareMaxBatchSize = (options?: {
  maxBatchSize?: number;
  disableBatch?: boolean;
}): number => {
  if (options?.disableBatch === true) return 1;
  const maxBatchSize = options?.maxBatchSize;
  if (maxBatchSize === undefined || maxBatchSize === Infinity) return Infinity;
  if (!Number.isInteger(maxBatchSize) || maxBatchSize < 1)
    throw new DataLoaderError(
      'INVALID_MAX_BATCH_SIZE',
      `DataLoaderOptions > maxBatchSize must be a positive integer : ${maxBatchSize}`,
      { maxBatchSize },
    );
  return maxBatchSize;
};

export const prepareCacheMap = <CacheKey, Value>(
  cacheMap?: MapLike<CacheKey, Promise<Value>> | false,
): MapLike<CacheKey, Promise<Value>> | null => {
  if (cacheMap === false) return null;
  if (cacheMap === undefined) return new Map();
  const missingMethods = ['get', 'set', 'delete', 'clear'].filter(
    (fnName) =>
      !isFunction(cacheMap[fnName as keyof MapLike<CacheKey, Value>] as any),
  );
  if (missingMethods.length > 0)
    throw new DataLoaderError(
      'INVALID_CACHE',
      `DataLoaderOptions > cache must additionally implement the following methods: ${missingMethods.join(', ')}`,
      { cacheMap, missingMethods },
    );
  return cacheMap;
};

export const prepareCacheKeyFn = <Key, CacheKey>(
  cacheKeyFn?: Fn<[key: Key], CacheKey>,
): Fn<[key: Key], CacheKey> => {
  if (cacheKeyFn === undefined)
    return IDENTITY_FUNCTION as Fn<[key: Key], CacheKey>;
  if (!isFunction(cacheKeyFn))
    throw new DataLoaderError(
      'INVALID_CACHE_KEY_FN',
      `DataLoaderOptions > cacheKeyFn must be a function: ${cacheKeyFn}`,
      { cacheKeyFn },
    );
  return cacheKeyFn;
};
