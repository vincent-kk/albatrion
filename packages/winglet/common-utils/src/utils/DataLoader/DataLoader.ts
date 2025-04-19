import type { Fn } from '@aileron/declare';

import { noopFunction } from '@/common-utils/constant';
import { InvalidTypeError } from '@/common-utils/errors/InvalidTypeError';
import { isArrayLike } from '@/common-utils/utils/filter/isArrayLike';
import { isFunction } from '@/common-utils/utils/filter/isFunction';
import { isNil } from '@/common-utils/utils/filter/isNil';

import type { Batch, BatchLoader, DataLoaderOptions, MapLike } from './type';
import {
  createBatch,
  failedDispatch,
  resolveCacheHits,
} from './utils/dispatch';
import {
  getValidBatchLoader,
  getValidBatchScheduler,
  getValidCacheKeyFn,
  getValidCacheMap,
  getValidMaxBatchSize,
} from './utils/validateOptions';

export class DataLoader<Key = string, Value = any, CacheKey = Key> {
  public readonly name: string | null = null;

  readonly #batchLoader: BatchLoader<Key, Value>;
  readonly #maxBatchSize: number;
  readonly #batchScheduler: Fn<[task: Fn]>;
  readonly #cacheMap: MapLike<CacheKey, Promise<Value>> | null;
  readonly #cacheKeyFn: Fn<[key: Key], CacheKey>;

  #currentBatch: Batch<Key, Value> | null = null;

  get #batch(): Batch<Key, Value> {
    const batch = this.#currentBatch;
    if (batch && !batch.isResolved && batch.keys.length < this.#maxBatchSize)
      return batch;
    const nextBatch = createBatch<Key, Value>();
    this.#currentBatch = nextBatch;
    this.#batchScheduler(() => {
      this.#dispatchBatch(nextBatch);
    });
    return nextBatch;
  }

  constructor(
    batchLoader: BatchLoader<Key, Value>,
    options?: DataLoaderOptions<Key, Value, CacheKey>,
  ) {
    this.#batchLoader = getValidBatchLoader(batchLoader);
    this.#maxBatchSize = getValidMaxBatchSize(options);
    this.#batchScheduler = getValidBatchScheduler(options?.batchScheduler);
    this.#cacheMap = getValidCacheMap(options?.cache);
    this.#cacheKeyFn = getValidCacheKeyFn(options?.cacheKeyFn);
    this.name = options?.name ?? null;
  }

  load(key: Key): Promise<Value> {
    if (isNil(key))
      throw new InvalidTypeError(
        'INVALID_KEY',
        `DataLoader > load's key must be a non-nil value: ${key}`,
        { key },
      );
    const batch = this.#batch;
    const cacheMap = this.#cacheMap;
    const cacheKey = cacheMap ? this.#cacheKeyFn(key) : null;
    if (cacheMap && cacheKey) {
      const cachedPromise = cacheMap.get(cacheKey);
      if (cachedPromise) {
        const cacheHits = batch.cacheHits || (batch.cacheHits = []);
        return new Promise((resolve) => {
          cacheHits.push(() => {
            resolve(cachedPromise);
          });
        });
      }
    }
    batch.keys.push(key);
    const promise = new Promise<Value>((resolve, reject) => {
      batch.promises.push({ resolve, reject });
    });
    if (cacheMap && cacheKey) cacheMap.set(cacheKey, promise);
    return promise;
  }

  loadMany(keys: ReadonlyArray<Key>): Promise<Array<Value | Error>> {
    if (!isArrayLike(keys))
      throw new InvalidTypeError(
        'INVALID_KEYS',
        `DataLoader > loadMany's keys must be an array-like object: ${keys}`,
        { keys },
      );
    const loadPromises = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
      loadPromises[i] = this.load(keys[i]).catch((error) => error);
    }
    return Promise.all(loadPromises);
  }

  clear(key: Key): this {
    const cacheMap = this.#cacheMap;
    if (cacheMap) {
      const cacheKey = this.#cacheKeyFn(key);
      cacheMap.delete(cacheKey);
    }
    return this;
  }

  clearAll(): this {
    this.#cacheMap?.clear();
    return this;
  }

  prime(key: Key, value: Value | Promise<Value> | Error): this {
    const cacheMap = this.#cacheMap;
    if (cacheMap) {
      const cacheKey = this.#cacheKeyFn(key);
      if (cacheMap.get(cacheKey) === undefined) {
        let promise: Promise<Value>;
        if (value instanceof Error) {
          promise = Promise.reject(value);
          promise.catch(noopFunction);
        } else {
          promise = Promise.resolve(value);
        }
        cacheMap.set(cacheKey, promise);
      }
    }
    return this;
  }

  #dispatchBatch(batch: Batch<Key, Value>): void {
    batch.isResolved = true;
    if (!batch.keys.length) return resolveCacheHits(batch);
    const batchPromise = this.#stableBatchLoader(batch.keys);
    if (batchPromise instanceof Error)
      return failedDispatch(this, batch, batchPromise);
    if (!isFunction(batchPromise?.then))
      return failedDispatch(
        this,
        batch,
        new InvalidTypeError(
          'INVALID_BATCH_LOADER',
          'DataLoader > batchLoader must be a function that returns a Promise<Array<value>>.',
          { batchPromise },
        ),
      );
    batchPromise
      .then((values) => {
        if (!isArrayLike(values))
          throw new InvalidTypeError(
            'INVALID_BATCH_LOADER',
            `DataLoader > batchLoader must be a function that returns a Promise<Array<value>>, but it returned a non-array value: ${values}`,
            { values },
          );
        if (values.length !== batch.keys.length)
          throw new InvalidTypeError(
            'INVALID_BATCH_LOADER',
            `DataLoader > batchLoader must be a function that returns a Promise<Array<value>>, but it returned an array with a length of ${values.length} while the batch had a length of ${batch.keys.length}`,
            { values, keys: batch.keys },
          );
        resolveCacheHits(batch);
        for (let i = 0; i < batch.promises.length; i++) {
          const value = values[i];
          if (value instanceof Error) batch.promises[i].reject(value);
          else batch.promises[i].resolve(value);
        }
      })
      .catch((error) => {
        failedDispatch(this, batch, error);
      });
  }

  #stableBatchLoader(
    keys: ReadonlyArray<Key>,
  ): ReturnType<BatchLoader<Key, Value>> | Error {
    try {
      return this.#batchLoader(keys);
    } catch (error: any) {
      return error;
    }
  }
}
