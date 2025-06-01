import {
  InvalidTypeError,
  isArrayLike,
  isFunction,
  isNil,
  noopFunction,
} from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import type { Batch, BatchLoader, DataLoaderOptions, MapLike } from './type';
import {
  createBatch,
  failedDispatch,
  resolveCacheHits,
} from './utils/dispatch';
import {
  prepareBatchLoader,
  prepareBatchScheduler,
  prepareCacheKeyFn,
  prepareCacheMap,
  prepareMaxBatchSize,
} from './utils/prepare';

/**
 * DataLoader – A rewritten utility for batching and caching asynchronous data fetching.
 *
 * This implementation is inspired by the original "Loader" API developed by [@schrockn](https://github.com/schrockn)
 * at Facebook in 2010, which was designed to simplify and consolidate various key-value store back-end APIs.
 *
 * While conceptually based on [GraphQL DataLoader](https://github.com/graphql/dataloader), this version is a
 * ground-up rewrite focused on performance optimizations, type safety, and adaptation to specific runtime requirements.
 *
 * @see https://github.com/graphql/dataloader
 *
 * NOTE: This implementation may differ from the original API and is not guaranteed to be fully compatible.
 */
export class DataLoader<Key = string, Value = any, CacheKey = Key> {
  /** The name of the DataLoader */
  public readonly name: string | null = null;

  /** The batch loader function that transforms a set of keys to a set of values */
  readonly #batchLoader: BatchLoader<Key, Value>;
  /** The maximum number of keys to process in a single batch */
  readonly #maxBatchSize: number;
  /** The function that schedules batch execution */
  readonly #batchScheduler: Fn<[task: Fn]>;
  /** The cache map object, null when caching is disabled */
  readonly #cacheMap: MapLike<CacheKey, Promise<Value>> | null;
  /** The function that converts loader keys to cache keys */
  readonly #cacheKeyFn: Fn<[key: Key], CacheKey>;

  /** The currently processing batch */
  #currentBatch: Batch<Key, Value> | null = null;

  /**
   * Getter that retrieves the current batch or creates a new batch
   * @returns The currently available batch or a newly created batch
   */
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

  /**
   * DataLoader constructor
   * @param batchLoader - The function that performs batch loading
   * @param options - DataLoader configuration options
   */
  constructor(
    batchLoader: BatchLoader<Key, Value>,
    options?: DataLoaderOptions<Key, Value, CacheKey>,
  ) {
    // An asynchronous batch loader function must be provided
    this.#batchLoader = prepareBatchLoader(batchLoader);
    // Set the maximum batch size (default: Infinity)
    this.#maxBatchSize = prepareMaxBatchSize(options);
    // Set the batch scheduler (default: nextTick)
    this.#batchScheduler = prepareBatchScheduler(options?.batchScheduler);
    // Set the caching map (null when disabled)
    this.#cacheMap = prepareCacheMap(options?.cache);
    // Set the cache key function (default: identity function)
    this.#cacheKeyFn = prepareCacheKeyFn(options?.cacheKeyFn);
    // Set optional name
    this.name = options?.name ?? null;
  }

  /**
   * Loads the value corresponding to a single key
   * Efficiently loads data using batching and caching
   * @param key - The key for the value to load
   * @returns Promise of the loaded value
   * @throws {InvalidTypeError} When the key is null or undefined
   */
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

  /**
   * Loads values corresponding to multiple keys
   * Other values are collected normally even if one key fails
   * @param keys - Array of keys for values to load
   * @returns Promise of an array of values or errors corresponding to each key
   * @throws {InvalidTypeError} When keys is not an array-like object
   */
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

  /**
   * Removes the specified key from the cache
   * @param key - The key to remove from the cache
   * @returns This object for method chaining
   */
  clear(key: Key): this {
    const cacheMap = this.#cacheMap;
    if (cacheMap) {
      const cacheKey = this.#cacheKeyFn(key);
      cacheMap.delete(cacheKey);
    }
    return this;
  }

  /**
   * Removes all keys from the cache
   * @returns This object for method chaining
   */
  clearAll(): this {
    this.#cacheMap?.clear();
    return this;
  }

  /**
   * Programmatically caches by updating the value for the given key
   * @param key - The key to associate with the value
   * @param value - The value to cache, Promise, or Error
   * @returns This object for method chaining
   */
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

  /**
   * Internal method that processes batches
   * Loads values through the batch loader and delivers those values
   * to the provided Promise
   * @param batch - The batch object to process
   */
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

  /**
   * Wrapper function for stable batch loading execution
   * Catches and handles exceptions that occur during batch loader execution
   * @param keys - Array of keys to load
   * @returns The result of the batch loader or an error
   */
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
