import type { Fn } from '@aileron/declare';

/**
 * Function type that loads data in batches
 * @template Key - The key type for values to load
 * @template Value - The type of values to return
 */
export type BatchLoader<Key, Value> = (
  /** Array of keys to load */
  keys: ReadonlyArray<Key>,
  /** Promise of an array of loaded values or errors */
) => Promise<ReadonlyArray<Value | Error>>;

/**
 * DataLoader configuration options
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
      /** Maximum batch size to process at once */
      maxBatchSize?: number;
    }
  | {
      /** Option to disable batch processing */
      disableBatch: true;
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
    reject: Fn<[error: Error]>;
  }>;
  /** Array of callback functions for cache hit processing */
  cacheHits?: Array<Fn>;
};
