/**
 * Factory function to create a WeakMap-based cache or memoization object
 * Provides functionality to store and retrieve values using object keys
 * @template V - Type of the values to be stored
 * @template K - Type of the key objects (must be objects)
 * @param defaultValue - Default WeakMap for initialization
 * @returns Object containing cache management functions
 */
export const weakMapCacheFactory = <V, K extends object = object>(
  defaultValue?: WeakMap<K, V>,
) => {
  // Create new WeakMap if default value is not provided
  const cache = defaultValue ?? (new WeakMap() as WeakMap<K, V>);
  return {
    /**
     * Returns the original WeakMap object
     */
    get raw() {
      return cache;
    },
    /**
     * Checks if the given key exists in the cache
     * @param key - The key to check
     * @returns Whether the key exists
     */
    has: (key: K) => cache.has(key),
    /**
     * Gets the value for the given key
     * @param key - The key to find the value for
     * @returns The value corresponding to the key or undefined
     */
    get: (key: K) => cache.get(key),
    /**
     * Stores a value for the given key
     * @param key - The key to store
     * @param value - The value to store
     * @returns The cache object itself for method chaining
     */
    set: (key: K, value: V) => cache.set(key, value),
    /**
     * Deletes the key and its corresponding value from the cache
     * @param key - The key to delete
     * @returns Whether the deletion was successful
     */
    delete: (key: K) => cache.delete(key),
  };
};

/**
 * Factory function to create a Map-based cache object
 * Provides functionality to store and manage values using string keys
 * @template M - Map type
 * @param defaultValue - Default Map object or entries for initialization
 * @returns Object containing cache management functions
 */
export const mapCacheFactory = <M extends Map<string, any>>(
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
