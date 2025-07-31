/**
 * Creates a feature-rich Map-based cache with enhanced API and method chaining support.
 *
 * Provides a convenient wrapper around native Map with additional functionality
 * including size tracking, raw access, and fluent interface for cache operations.
 * Ideal for implementing memoization, data caching, and key-value storage patterns
 * with strong type safety and performance optimization.
 *
 * @template M - The Map type, extending Map<string, any> for flexible value types
 * @param defaultValue - Initial Map instance or iterable entries for cache initialization
 * @returns Enhanced cache object with comprehensive management methods
 *
 * @example
 * Basic cache usage:
 * ```typescript
 * import { cacheMapFactory } from '@winglet/common-utils';
 *
 * const userCache = cacheMapFactory<Map<string, User>>();
 *
 * // Store user data
 * userCache.set('user123', { id: '123', name: 'John Doe', email: 'john@example.com' });
 * userCache.set('user456', { id: '456', name: 'Jane Smith', email: 'jane@example.com' });
 *
 * // Retrieve user data
 * const user = userCache.get('user123');
 * console.log(user?.name); // 'John Doe'
 *
 * // Check cache status
 * console.log(userCache.has('user123')); // true
 * console.log(userCache.size()); // 2
 * ```
 *
 * @example
 * Initialize with existing data:
 * ```typescript
 * // Initialize with entries
 * const configCache = cacheMapFactory([
 *   ['theme', 'dark'],
 *   ['language', 'en'],
 *   ['timeout', 5000]
 * ]);
 *
 * // Initialize with existing Map
 * const existingMap = new Map([['key1', 'value1'], ['key2', 'value2']]);
 * const cache = cacheMapFactory(existingMap);
 *
 * console.log(cache.get('key1')); // 'value1'
 * ```
 *
 * @example
 * Memoization pattern:
 * ```typescript
 * interface FibonacciCache {
 *   [key: string]: number;
 * }
 *
 * const fibCache = cacheMapFactory<Map<string, number>>();
 *
 * function fibonacci(n: number): number {
 *   const key = n.toString();
 *   
 *   if (fibCache.has(key)) {
 *     return fibCache.get(key)!;
 *   }
 *
 *   const result = n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);
 *   fibCache.set(key, result);
 *   
 *   return result;
 * }
 *
 * console.log(fibonacci(40)); // Computed and cached
 * console.log(fibonacci(40)); // Retrieved from cache
 * console.log(fibCache.size()); // Shows number of cached values
 * ```
 *
 * @example
 * Advanced cache management:
 * ```typescript
 * const apiCache = cacheMapFactory<Map<string, ApiResponse>>();
 *
 * class ApiClient {
 *   async getData(endpoint: string): Promise<ApiResponse> {
 *     if (apiCache.has(endpoint)) {
 *       console.log('Cache hit:', endpoint);
 *       return apiCache.get(endpoint)!;
 *     }
 *
 *     console.log('Cache miss, fetching:', endpoint);
 *     const response = await fetch(endpoint).then(r => r.json());
 *     
 *     apiCache.set(endpoint, response);
 *     return response;
 *   }
 *
 *   clearCache(): void {
 *     apiCache.clear();
 *     console.log('Cache cleared');
 *   }
 *
 *   getCacheStats(): { size: number; keys: string[] } {
 *     return {
 *       size: apiCache.size(),
 *       keys: Array.from(apiCache.keys())
 *     };
 *   }
 * }
 * ```
 *
 * @example
 * Iterating over cache contents:
 * ```typescript
 * const cache = cacheMapFactory<Map<string, number>>([
 *   ['a', 1], ['b', 2], ['c', 3]
 * ]);
 *
 * // Iterate over keys
 * for (const key of cache.keys()) {
 *   console.log(`Key: ${key}`);
 * }
 *
 * // Iterate over values
 * for (const value of cache.values()) {
 *   console.log(`Value: ${value}`);
 * }
 *
 * // Iterate over entries
 * for (const [key, value] of cache.entries()) {
 *   console.log(`${key}: ${value}`);
 * }
 *
 * // Access raw Map for advanced operations
 * cache.raw.forEach((value, key) => {
 *   console.log(`Processing ${key} with value ${value}`);
 * });
 * ```
 *
 * @remarks
 * **Key Features:**
 * - **Type Safety**: Full TypeScript support with generic type parameters
 * - **Method Chaining**: Fluent interface for cache operations
 * - **Raw Access**: Direct access to underlying Map for advanced operations
 * - **Iterator Support**: Full support for ES6 iteration protocols
 * - **Memory Efficient**: Leverages native Map implementation
 *
 * **Performance Benefits:**
 * - O(1) average time complexity for get/set/has/delete operations
 * - Efficient memory usage with native Map storage
 * - No additional overhead beyond native Map functionality
 * - Optimized for frequent lookups and updates
 *
 * **Use Cases:**
 * - **Function Memoization**: Cache expensive computation results
 * - **API Response Caching**: Store and reuse network responses
 * - **Configuration Management**: Key-value configuration storage
 * - **Session Management**: Store user session data
 * - **Template Caching**: Cache compiled templates or processed content
 */
export const cacheMapFactory = <M extends Map<string, any>>(
  defaultValue?: M | ReturnType<M['entries']>,
) => {
  // Use as-is if default value is a Map instance, otherwise create new Map
  const cache =
    defaultValue instanceof Map ? defaultValue : new Map(defaultValue || []);
  return {
    /**
     * Returns the original Map object
     */
    get raw() {
      return cache;
    },
    /**
     * Stores a value for the given key
     * @param key - The key to store
     * @param value - The value to store
     * @returns The cache object itself for method chaining
     */
    set: (key: Parameters<M['set']>[0], value: Parameters<M['set']>[1]) =>
      cache.set(key, value),
    /**
     * Checks if the given key exists in the cache
     * @param key - The key to check
     * @returns Whether the key exists
     */
    has: (key: Parameters<M['has']>[0]) => cache.has(key),
    /**
     * Gets the value for the given key
     * @param key - The key to find the value for
     * @returns The value corresponding to the key or undefined
     */
    get: (key: Parameters<M['get']>[0]) => cache.get(key),
    /**
     * Deletes the key and its corresponding value from the cache
     * @param key - The key to delete
     * @returns Whether the deletion was successful
     */
    delete: (key: Parameters<M['delete']>[0]) => cache.delete(key),
    /**
     * Returns the number of elements stored in the cache
     * @returns Number of elements
     */
    size: () => cache.size,
    /**
     * Returns all keys in the cache
     * @returns Key iterator
     */
    keys: () => cache.keys(),
    /**
     * Returns all values in the cache
     * @returns Value iterator
     */
    values: () => cache.values(),
    /**
     * Returns all key-value pairs in the cache
     * @returns Key-value pair iterator
     */
    entries: () => cache.entries(),
    /**
     * Clears all elements from the cache
     */
    clear: () => cache.clear(),
  };
};
