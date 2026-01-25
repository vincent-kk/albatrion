import { NOOP_FUNCTION } from '@winglet/common-utils/constant';
import { isArrayLike, isFunction, isNil } from '@winglet/common-utils/filter';

import type { Fn } from '@aileron/declare';

import type { Batch, BatchLoader, DataLoaderOptions, MapLike } from './type';
import {
  createBatch,
  failedDispatch,
  resolveCacheHits,
} from './utils/dispatch';
import { DataLoaderError } from './utils/error';
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
 *
 * @example
 * Basic usage with database queries:
 * ```typescript
 * import { DataLoader } from '@winglet/data-loader';
 *
 * // Create a batch loading function
 * async function batchLoadUsers(userIds: string[]): Promise<User[]> {
 *   const users = await db.query(
 *     'SELECT * FROM users WHERE id IN (?)',
 *     [userIds]
 *   );
 *
 *   // IMPORTANT: Return array in same order as input keys
 *   return userIds.map(id =>
 *     users.find(user => user.id === id) || new Error(`User ${id} not found`)
 *   );
 * }
 *
 * // Create the DataLoader instance
 * const userLoader = new DataLoader(batchLoadUsers, {
 *   maxBatchSize: 100, // Limit SQL query size
 *   cache: true,       // Enable caching (default)
 * });
 *
 * // Load individual users - automatically batched
 * const user1 = await userLoader.load('user-1');
 * const user2 = await userLoader.load('user-2');
 * const user3 = await userLoader.load('user-3');
 * // Results in ONE database query: SELECT * FROM users WHERE id IN ('user-1', 'user-2', 'user-3')
 * ```
 *
 * @example
 * GraphQL resolver integration:
 * ```typescript
 * // Define DataLoaders per request to avoid cross-request caching
 * function createLoaders() {
 *   return {
 *     users: new DataLoader(batchLoadUsers),
 *     posts: new DataLoader(batchLoadPosts),
 *     comments: new DataLoader(batchLoadComments),
 *   };
 * }
 *
 * // GraphQL resolvers
 * const resolvers = {
 *   Query: {
 *     user: (parent, { id }, { loaders }) => loaders.users.load(id),
 *   },
 *   User: {
 *     posts: (user, args, { loaders }) =>
 *       loaders.posts.loadMany(user.postIds),
 *   },
 *   Post: {
 *     author: (post, args, { loaders }) =>
 *       loaders.users.load(post.authorId),
 *     comments: (post, args, { loaders }) =>
 *       loaders.comments.loadMany(post.commentIds),
 *   },
 * };
 *
 * // Express middleware
 * app.use('/graphql', (req, res) => {
 *   const loaders = createLoaders(); // Fresh loaders per request
 *   return graphqlHTTP({
 *     schema,
 *     rootValue: resolvers,
 *     context: { loaders },
 *   })(req, res);
 * });
 * ```
 *
 * @example
 * Custom cache key for complex objects:
 * ```typescript
 * interface ProductQuery {
 *   id: string;
 *   currency: string;
 *   includeReviews?: boolean;
 * }
 *
 * const productLoader = new DataLoader<ProductQuery, Product, string>(
 *   async (queries) => {
 *     // Group by options for efficient fetching
 *     const results = await Promise.all(
 *       queries.map(query => fetchProduct(query))
 *     );
 *     return results;
 *   },
 *   {
 *     // Custom cache key to handle complex query objects
 *     cacheKeyFn: (query) =>
 *       `${query.id}-${query.currency}-${query.includeReviews || false}`,
 *   }
 * );
 *
 * // Same product with different currencies cached separately
 * const productUSD = await productLoader.load({
 *   id: 'prod-1',
 *   currency: 'USD'
 * });
 * const productEUR = await productLoader.load({
 *   id: 'prod-1',
 *   currency: 'EUR'
 * });
 * ```
 *
 * @example
 * Custom batch scheduling:
 * ```typescript
 * // Immediate batching for time-sensitive operations
 * const immediateLoader = new DataLoader(batchLoad, {
 *   batchScheduler: (callback) => callback(), // No delay
 * });
 *
 * // Debounced batching for less critical operations
 * const debouncedLoader = new DataLoader(batchLoad, {
 *   batchScheduler: (callback) => {
 *     setTimeout(callback, 10); // 10ms debounce
 *   },
 * });
 *
 * // RAF-based batching for UI operations
 * const uiLoader = new DataLoader(batchLoad, {
 *   batchScheduler: (callback) => {
 *     if (typeof requestAnimationFrame !== 'undefined') {
 *       requestAnimationFrame(callback);
 *     } else {
 *       setImmediate(callback);
 *     }
 *   },
 * });
 * ```
 *
 * @example
 * Disabling cache for sensitive data:
 * ```typescript
 * // Disable caching for frequently changing data
 * const stockPriceLoader = new DataLoader(batchLoadStockPrices, {
 *   cache: false, // Always fetch fresh data
 * });
 *
 * // Or use a custom cache with TTL
 * class TtlMap<K, V> implements MapLike<K, V> {
 *   private cache = new Map<K, { value: V; expires: number }>();
 *   private ttl: number;
 *
 *   constructor(ttlMs: number) {
 *     this.ttl = ttlMs;
 *   }
 *
 *   get(key: K): V | undefined {
 *     const item = this.cache.get(key);
 *     if (!item) return undefined;
 *
 *     if (Date.now() > item.expires) {
 *       this.cache.delete(key);
 *       return undefined;
 *     }
 *
 *     return item.value;
 *   }
 *
 *   set(key: K, value: V): void {
 *     this.cache.set(key, {
 *       value,
 *       expires: Date.now() + this.ttl,
 *     });
 *   }
 *
 *   delete(key: K): boolean {
 *     return this.cache.delete(key);
 *   }
 *
 *   clear(): void {
 *     this.cache.clear();
 *   }
 * }
 *
 * const cachedLoader = new DataLoader(batchLoadPrices, {
 *   cacheMap: new TtlMap(60000), // 1 minute TTL
 * });
 * ```
 *
 * @remarks
 * **Key Benefits:**
 * - **Batching**: Multiple loads are automatically batched into a single request
 * - **Caching**: Results are cached to prevent duplicate fetches within a request
 * - **Deduplication**: Identical keys in the same batch are deduplicated
 * - **Error Boundaries**: Individual errors don't fail the entire batch
 *
 * **Important Considerations:**
 * - Batch functions must return arrays in the same order as input keys
 * - Use Error instances to represent individual failures
 * - Create new DataLoader instances per request to avoid cross-request pollution
 * - Consider disabling cache for frequently changing data
 * - Prime the cache after mutations to keep it consistent
 */
export class DataLoader<Key = string, Value = any, CacheKey = Key> {
  /** The name of the DataLoader */
  public readonly name: string | null = null;

  /** The batch loader function that transforms a set of keys to a set of values */
  private readonly __batchLoader__: BatchLoader<Key, Value>;
  /** The maximum number of keys to process in a single batch */
  private readonly __maxBatchSize__: number;
  /** The function that schedules batch execution */
  private readonly __batchScheduler__: Fn<[task: Fn]>;
  /** The cache map object, null when caching is disabled */
  private readonly __cacheMap__: MapLike<CacheKey, Promise<Value>> | null;
  /** The function that converts loader keys to cache keys */
  private readonly __cacheKeyFn__: Fn<[key: Key], CacheKey>;

  /** The currently processing batch */
  private __currentBatch__: Batch<Key, Value> | null = null;

  /**
   * Acquires the current batch or creates a new batch
   * @returns The currently available batch or a newly created batch
   */
  private __acquireBatch__(): Batch<Key, Value> {
    const batch = this.__currentBatch__;
    if (batch && !batch.isResolved && batch.keys.length < this.__maxBatchSize__)
      return batch;
    const nextBatch = createBatch<Key, Value>();
    this.__currentBatch__ = nextBatch;
    this.__batchScheduler__(() => {
      this.__dispatchBatch__(nextBatch);
    });
    return nextBatch;
  }

  /**
   * Creates a new DataLoader instance with batch loading and caching capabilities.
   *
   * @param batchLoader - The function that performs batch loading. Must return a Promise
   *                      of an array with values in the same order as the input keys.
   * @param options - Optional configuration for cache behavior, batching, and scheduling
   *
   * @example
   * Basic DataLoader with default options:
   * ```typescript
   * const userLoader = new DataLoader(async (ids: string[]) => {
   *   const users = await fetchUsersByIds(ids);
   *   // Must return in same order as ids
   *   return ids.map(id =>
   *     users.find(u => u.id === id) || new Error(`User ${id} not found`)
   *   );
   * });
   * ```
   *
   * @example
   * DataLoader with custom options:
   * ```typescript
   * const productLoader = new DataLoader(
   *   async (ids) => fetchProductsByIds(ids),
   *   {
   *     // Give the loader a name for debugging
   *     name: 'ProductLoader',
   *
   *     // Limit batch size to avoid huge queries
   *     maxBatchSize: 50,
   *
   *     // Custom cache key for complex objects
   *     cacheKeyFn: (key) => `${key.id}-${key.variant}`,
   *
   *     // Use microtask scheduling for faster batching
   *     batchScheduler: (fn) => queueMicrotask(fn),
   *   }
   * );
   * ```
   *
   * @example
   * DataLoader with disabled cache:
   * ```typescript
   * const realtimeDataLoader = new DataLoader(
   *   async (keys) => fetchRealtimeData(keys),
   *   {
   *     // Disable cache for real-time data
   *     cache: false,
   *
   *     // Larger batches since we're not caching
   *     maxBatchSize: 200,
   *   }
   * );
   * ```
   *
   * @example
   * DataLoader with custom cache implementation:
   * ```typescript
   * import LRU from 'lru-cache';
   *
   * const apiLoader = new DataLoader(
   *   async (endpoints) => {
   *     const responses = await Promise.all(
   *       endpoints.map(ep => fetch(ep).then(r => r.json()))
   *     );
   *     return responses;
   *   },
   *   {
   *     // Use LRU cache with max 1000 entries
   *     cacheMap: new LRU({ max: 1000 }),
   *
   *     // Cache key is the URL itself
   *     cacheKeyFn: (url) => url,
   *   }
   * );
   * ```
   */
  constructor(
    batchLoader: BatchLoader<Key, Value>,
    options?: DataLoaderOptions<Key, Value, CacheKey>,
  ) {
    // An asynchronous batch loader function must be provided
    this.__batchLoader__ = prepareBatchLoader(batchLoader);
    // Set the maximum batch size (default: Infinity)
    this.__maxBatchSize__ = prepareMaxBatchSize(options);
    // Set the batch scheduler (default: nextTick)
    this.__batchScheduler__ = prepareBatchScheduler(options?.batchScheduler);
    // Set the caching map (null when disabled)
    this.__cacheMap__ = prepareCacheMap(options?.cache);
    // Set the cache key function (default: identity function)
    this.__cacheKeyFn__ = prepareCacheKeyFn(options?.cacheKeyFn);
    // Set optional name
    this.name = options?.name ?? null;
  }

  /**
   * Loads the value corresponding to a single key.
   *
   * Efficiently loads data using batching and caching. Multiple calls with the same key
   * return the same promise (deduplication), and multiple calls with different keys
   * are automatically batched into a single request.
   *
   * @param key - The key for the value to load
   * @returns Promise of the loaded value
   * @throws {DataLoaderError} When the key is null or undefined
   *
   * @example
   * Basic loading with automatic batching:
   * ```typescript
   * const userLoader = new DataLoader(batchLoadUsers);
   *
   * // These three calls will be batched into ONE database query
   * const [user1, user2, user3] = await Promise.all([
   *   userLoader.load('user-1'),
   *   userLoader.load('user-2'),
   *   userLoader.load('user-3')
   * ]);
   * ```
   *
   * @example
   * Deduplication of identical keys:
   * ```typescript
   * const loader = new DataLoader(batchLoad);
   *
   * // Only ONE actual load for 'key-1' despite three calls
   * const promise1 = loader.load('key-1');
   * const promise2 = loader.load('key-1');
   * const promise3 = loader.load('key-1');
   *
   * console.log(promise1 === promise2); // true - same promise returned
   * console.log(promise2 === promise3); // true
   * ```
   *
   * @example
   * Error handling for individual keys:
   * ```typescript
   * const loader = new DataLoader(async (keys) => {
   *   return keys.map(key => {
   *     if (key === 'invalid') {
   *       return new Error(`Key ${key} is invalid`);
   *     }
   *     return { id: key, name: `User ${key}` };
   *   });
   * });
   *
   * try {
   *   await loader.load('invalid');
   * } catch (error) {
   *   console.error('Load failed:', error.message); // "Key invalid is invalid"
   * }
   * ```
   */
  load(key: Key): Promise<Value> {
    if (isNil(key))
      throw new DataLoaderError(
        'INVALID_KEY',
        `DataLoader > load's key must be a non-nil value: ${key}`,
        { key },
      );
    const batch = this.__acquireBatch__();
    const cacheMap = this.__cacheMap__;
    const cacheKey = cacheMap ? this.__cacheKeyFn__(key) : null;
    if (cacheMap && cacheKey) {
      const cachedPromise = cacheMap.get(cacheKey);
      if (cachedPromise) {
        const cacheHits = batch.cacheHits || (batch.cacheHits = []);
        return new Promise((resolve) =>
          cacheHits.push(() => resolve(cachedPromise)),
        );
      }
    }
    batch.keys.push(key);
    const promise = new Promise<Value>((resolve, reject) =>
      batch.promises.push({ resolve, reject }),
    );
    if (cacheMap && cacheKey) cacheMap.set(cacheKey, promise);
    return promise;
  }

  /**
   * Loads values corresponding to multiple keys.
   *
   * Efficiently loads multiple values in a single batch while providing individual
   * error handling. Failed loads return Error instances instead of throwing,
   * allowing partial success scenarios.
   *
   * @param keys - Array of keys for values to load
   * @returns Promise of an array of values or errors corresponding to each key
   * @throws {DataLoaderError} When keys is not an array-like object
   *
   * @example
   * Basic batch loading:
   * ```typescript
   * const userLoader = new DataLoader(batchLoadUsers);
   *
   * const userIds = ['user-1', 'user-2', 'user-3', 'user-4'];
   * const results = await userLoader.loadMany(userIds);
   *
   * results.forEach((result, index) => {
   *   if (result instanceof Error) {
   *     console.error(`Failed to load ${userIds[index]}:`, result);
   *   } else {
   *     console.log(`Loaded user:`, result);
   *   }
   * });
   * ```
   *
   * @example
   * Handling partial failures gracefully:
   * ```typescript
   * const loader = new DataLoader(async (keys) => {
   *   return keys.map(key => {
   *     // Simulate some keys failing
   *     if (key.startsWith('invalid-')) {
   *       return new Error(`Key ${key} not found`);
   *     }
   *     return { id: key, data: `Data for ${key}` };
   *   });
   * });
   *
   * const results = await loader.loadMany([
   *   'valid-1',
   *   'invalid-1',
   *   'valid-2',
   *   'invalid-2'
   * ]);
   *
   * // Filter successful results
   * const successful = results.filter(
   *   (r): r is Value => !(r instanceof Error)
   * );
   * console.log('Loaded:', successful.length); // 2
   *
   * // Collect errors
   * const errors = results.filter(
   *   (r): r is Error => r instanceof Error
   * );
   * console.log('Failed:', errors.length); // 2
   * ```
   *
   * @example
   * Loading related data:
   * ```typescript
   * const postLoader = new DataLoader(batchLoadPosts);
   * const userLoader = new DataLoader(batchLoadUsers);
   *
   * async function loadPostsWithAuthors(postIds: string[]) {
   *   // Load all posts
   *   const posts = await postLoader.loadMany(postIds);
   *
   *   // Extract author IDs from successful loads
   *   const authorIds = posts
   *     .filter((p): p is Post => !(p instanceof Error))
   *     .map(post => post.authorId);
   *
   *   // Load all authors in one batch
   *   const authors = await userLoader.loadMany(authorIds);
   *
   *   // Combine results
   *   return posts.map((post, i) => {
   *     if (post instanceof Error) return post;
   *     const author = authors.find(a =>
   *       !(a instanceof Error) && a.id === post.authorId
   *     );
   *     return { ...post, author };
   *   });
   * }
   * ```
   */
  loadMany(keys: ReadonlyArray<Key>): Promise<Array<Value | Error>> {
    if (!isArrayLike(keys))
      throw new DataLoaderError(
        'INVALID_KEYS',
        `DataLoader > loadMany's keys must be an array-like object: ${keys}`,
        { keys },
      );
    const loadPromises = new Array(keys.length);
    for (let i = 0, l = keys.length; i < l; i++)
      loadPromises[i] = this.load(keys[i]).catch((error) => error);
    return Promise.all(loadPromises);
  }

  /**
   * Removes the specified key from the cache.
   *
   * Useful for invalidating stale data after mutations or when you know
   * the cached value is no longer valid. Only affects the cache; does not
   * cancel in-flight requests.
   *
   * @param key - The key to remove from the cache
   * @returns This DataLoader instance for method chaining
   *
   * @example
   * Cache invalidation after mutation:
   * ```typescript
   * const userLoader = new DataLoader(batchLoadUsers);
   *
   * async function updateUser(id: string, updates: Partial<User>) {
   *   // Perform the update
   *   const updatedUser = await api.updateUser(id, updates);
   *
   *   // Clear the old cached value
   *   userLoader.clear(id);
   *
   *   // Optionally prime with new data
   *   userLoader.prime(id, updatedUser);
   *
   *   return updatedUser;
   * }
   * ```
   *
   * @example
   * Clearing related caches:
   * ```typescript
   * const userLoader = new DataLoader(batchLoadUsers);
   * const teamLoader = new DataLoader(batchLoadTeams);
   *
   * async function removeUserFromTeam(userId: string, teamId: string) {
   *   await api.removeUserFromTeam(userId, teamId);
   *
   *   // Clear both caches as both are affected
   *   userLoader.clear(userId);  // User's team list changed
   *   teamLoader.clear(teamId);  // Team's member list changed
   * }
   * ```
   *
   * @example
   * Conditional cache clearing:
   * ```typescript
   * const productLoader = new DataLoader(batchLoadProducts, {
   *   cacheKeyFn: (key) => `${key.id}-${key.currency}`
   * });
   *
   * function clearProductCache(productId: string, currencies?: string[]) {
   *   if (currencies) {
   *     // Clear specific currency versions
   *     currencies.forEach(currency => {
   *       productLoader.clear({ id: productId, currency });
   *     });
   *   } else {
   *     // Would need to clear all currencies - better to use clearAll()
   *     console.warn('Consider using clearAll() to clear all cached versions');
   *   }
   * }
   * ```
   */
  clear(key: Key): this {
    const cacheMap = this.__cacheMap__;
    if (cacheMap) cacheMap.delete(this.__cacheKeyFn__(key));
    return this;
  }

  /**
   * Removes all keys from the cache.
   *
   * Completely empties the cache, useful when you need to force fresh data
   * fetches or during major state changes. More efficient than clearing
   * individual keys when invalidating many entries.
   *
   * @returns This DataLoader instance for method chaining
   *
   * @example
   * Clearing cache on user logout:
   * ```typescript
   * const userLoader = new DataLoader(batchLoadUsers);
   * const postLoader = new DataLoader(batchLoadPosts);
   * const commentLoader = new DataLoader(batchLoadComments);
   *
   * function handleLogout() {
   *   // Clear all user-specific cached data
   *   userLoader.clearAll();
   *   postLoader.clearAll();
   *   commentLoader.clearAll();
   *
   *   // Redirect to login
   *   router.push('/login');
   * }
   * ```
   *
   * @example
   * Periodic cache refresh:
   * ```typescript
   * const priceLoader = new DataLoader(batchLoadPrices);
   *
   * // Refresh prices every 5 minutes
   * setInterval(() => {
   *   console.log('Clearing price cache for fresh data');
   *   priceLoader.clearAll();
   * }, 5 * 60 * 1000);
   * ```
   *
   * @example
   * Environment-based cache clearing:
   * ```typescript
   * const dataLoader = new DataLoader(batchLoad, {
   *   name: 'production-data-loader'
   * });
   *
   * // Clear cache when switching environments
   * function switchEnvironment(env: 'dev' | 'staging' | 'prod') {
   *   dataLoader.clearAll();
   *   console.log(`Cleared cache for environment switch to ${env}`);
   *
   *   // Update API endpoints
   *   api.setBaseURL(environments[env].apiUrl);
   * }
   * ```
   */
  clearAll(): this {
    this.__cacheMap__?.clear();
    return this;
  }

  /**
   * Programmatically caches a value for the given key.
   *
   * Allows manual cache population, useful for seeding the cache with known
   * values or updating the cache after mutations. Accepts plain values,
   * promises, or errors. Will not override existing cache entries.
   *
   * @param key - The key to associate with the value
   * @param value - The value to cache, Promise, or Error
   * @returns This DataLoader instance for method chaining
   *
   * @example
   * Priming after successful mutation:
   * ```typescript
   * const userLoader = new DataLoader(batchLoadUsers);
   *
   * async function createUser(userData: CreateUserInput): Promise<User> {
   *   const newUser = await api.createUser(userData);
   *
   *   // Prime the cache with the newly created user
   *   userLoader.prime(newUser.id, newUser);
   *
   *   return newUser;
   * }
   * ```
   *
   * @example
   * Priming with known missing data:
   * ```typescript
   * const userLoader = new DataLoader(batchLoadUsers);
   *
   * async function deleteUser(userId: string): Promise<void> {
   *   await api.deleteUser(userId);
   *
   *   // Prime with error to prevent unnecessary fetches
   *   userLoader.prime(
   *     userId,
   *     new Error(`User ${userId} has been deleted`)
   *   );
   * }
   * ```
   *
   * @example
   * Bulk priming from list responses:
   * ```typescript
   * const userLoader = new DataLoader(batchLoadUsers);
   *
   * async function searchUsers(query: string): Promise<User[]> {
   *   const users = await api.searchUsers(query);
   *
   *   // Prime individual user cache from search results
   *   users.forEach(user => {
   *     userLoader.prime(user.id, user);
   *   });
   *
   *   return users;
   * }
   * ```
   *
   * @example
   * Priming with promises for lazy loading:
   * ```typescript
   * const expensiveDataLoader = new DataLoader(batchLoadExpensiveData);
   *
   * function primeWithLazyData(id: string) {
   *   // Prime with a promise that loads on demand
   *   const lazyPromise = new Promise<ExpensiveData>((resolve, reject) => {
   *     // This only executes when someone calls load(id)
   *     setTimeout(() => {
   *       loadExpensiveData(id).then(resolve).catch(reject);
   *     }, 0);
   *   });
   *
   *   expensiveDataLoader.prime(id, lazyPromise);
   * }
   * ```
   *
   * @remarks
   * - Does not override existing cache entries
   * - Errors are automatically caught to prevent unhandled rejections
   * - Useful for cache warming and post-mutation updates
   */
  prime(key: Key, value: Value | Promise<Value> | Error): this {
    const cacheMap = this.__cacheMap__;
    if (cacheMap) {
      const cacheKey = this.__cacheKeyFn__(key);
      if (cacheMap.get(cacheKey) === undefined) {
        let promise: Promise<Value>;
        if (value instanceof Error) {
          promise = Promise.reject(value);
          promise.catch(NOOP_FUNCTION);
        } else promise = Promise.resolve(value);
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
  private __dispatchBatch__(batch: Batch<Key, Value>): void {
    batch.isResolved = true;
    if (!batch.keys.length) return resolveCacheHits(batch);
    const batchPromise = this.__stableBatchLoader__(batch.keys);
    if (batchPromise instanceof Error)
      return failedDispatch(this, batch, batchPromise);
    if (!isFunction(batchPromise?.then))
      return failedDispatch(
        this,
        batch,
        new DataLoaderError(
          'INVALID_BATCH_LOADER',
          'DataLoader > batchLoader must be a function that returns a Promise<Array<value>>.',
          { batchPromise },
        ),
      );
    batchPromise
      .then((values) => {
        if (!isArrayLike(values))
          throw new DataLoaderError(
            'INVALID_BATCH_LOADER',
            `DataLoader > batchLoader must be a function that returns a Promise<Array<value>>, but it returned a non-array value: ${values}`,
            { values },
          );
        if (values.length !== batch.keys.length)
          throw new DataLoaderError(
            'INVALID_BATCH_LOADER',
            `DataLoader > batchLoader must be a function that returns a Promise<Array<value>>, but it returned an array with a length of ${values.length} while the batch had a length of ${batch.keys.length}`,
            { values, keys: batch.keys },
          );
        resolveCacheHits(batch);
        for (let i = 0, l = batch.promises.length; i < l; i++) {
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
  private __stableBatchLoader__(
    keys: ReadonlyArray<Key>,
  ): ReturnType<BatchLoader<Key, Value>> | Error {
    try {
      return this.__batchLoader__(keys);
    } catch (error: any) {
      return error;
    }
  }
}
