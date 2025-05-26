/**
 * Factory function to create a WeakMap-based cache or memoization object
 * Provides functionality to store and retrieve values using object keys
 * @template V - Type of the values to be stored
 * @template K - Type of the key objects (must be objects)
 * @param defaultValue - Default WeakMap for initialization
 * @returns Object containing cache management functions
 */
export const cacheWeakMapFactory = <V, K extends object = object>(
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
