import type { AsyncFn, Fn } from '@aileron/declare';

/**
 * Function type that loads data in batches
 * @template Key - The key type for values to load
 * @template Value - The type of values to return
 * @param keys - Array of keys to load
 * @returns Promise of an array of loaded values or errors
 */
export type BatchLoader<Key, Value> = AsyncFn<
  [keys: ReadonlyArray<Key>],
  ReadonlyArray<Value | Error>
>;

/**
 * DataLoader configuration options.
 *
 * Batching takes one of two shapes: on (the default), optionally capped by `maxBatchSize`,
 * or off with `disableBatch: true`. Passing `maxBatchSize` together with `disableBatch: true`
 * is a type error, because the two contradict each other.
 * @template Key - The type of keys to load
 * @template Value - The type of values to return
 * @template CacheKey - The type of cache keys (default: Key)
 */
export type DataLoaderOptions<Key, Value, CacheKey = Key> = {
  /** The name of the loader */
  name?: string;
  /** Cache map object or false (disabled) */
  cache?: MapLike<CacheKey, Promise<Value>> | false;
  /** Function for scheduling batch execution */
  batchScheduler?: Fn<[task: Fn]>;
  /** Function that converts loader keys to cache keys */
  cacheKeyFn?: Fn<[key: Key], CacheKey>;
} & (
  | {
      /** Keeps batching on, the default; `false` means the same as omitting it */
      disableBatch?: false;
      /**
       * Maximum number of keys per batch: a positive integer, or `Infinity` (the default).
       * Any other value makes the constructor throw `INVALID_MAX_BATCH_SIZE`.
       */
      maxBatchSize?: number;
    }
  | {
      /** Turns batching off: the batch loader receives one key per call, as with `maxBatchSize: 1` */
      disableBatch: true;
      /** Not accepted with `disableBatch: true`, which already limits every batch to one key */
      maxBatchSize?: never;
    }
);

/**
 * Cache storage type that follows the Map interface
 * @template Key - Cache key type
 * @template Value - Cache value type
 */
export type MapLike<Key, Value> = {
  /** Gets the value corresponding to the key or returns undefined */
  get(key: Key): Value | undefined;
  /** Sets a value for the key */
  set(key: Key, value: Value): any;
  /** Deletes the key and its corresponding value */
  delete(key: Key): any;
  /** Deletes all key-value pairs */
  clear(): any;
};

/**
 * Type that groups load operations by batch size
 * @template Key - Type of keys to load
 * @template Value - Type of values to be loaded
 */
export type Batch<Key, Value> = {
  /** Whether the batch has been processed */
  isResolved: boolean;
  /** Array of keys to load */
  keys: Array<Key>;
  /** Resolve/reject functions of Promise corresponding to each key */
  promises: Array<{
    resolve: Fn<[value: Value]>;
    reject: Fn<[error: unknown]>;
  }>;
  /** Array of callback functions for cache hit processing */
  cacheHits?: Array<Fn>;
};
