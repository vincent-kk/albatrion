import { getObjectKeys } from './getObjectKeys';
import { serializeNative } from './serializeNative';

/**
 * Converts objects to custom key-value serialized strings with pipe delimiters.
 *
 * Transforms objects into a compact string format using 'key:value' pairs separated
 * by pipe characters ('|'). Provides property exclusion capabilities and handles
 * non-object values gracefully by falling back to native JSON serialization.
 * Optimized for creating cache keys, query parameters, and compact representations.
 *
 * @param object - Object to serialize into key-value string format
 * @param omits - Array of property keys to exclude from serialization (optional)
 * @returns Pipe-delimited string of key-value pairs or JSON string for non-objects
 *
 * @example
 * Basic object serialization:
 * ```typescript
 * import { serializeObject } from '@winglet/common-utils';
 *
 * // Simple object
 * const user = { id: 1, name: 'John', active: true };
 * console.log(serializeObject(user)); // 'active:true|name:John|id:1'
 *
 * // Object with mixed value types
 * const config = {
 *   timeout: 5000,
 *   debug: false,
 *   endpoint: 'https://api.example.com',
 *   retries: 3
 * };
 * console.log(serializeObject(config));
 * // 'retries:3|endpoint:https://api.example.com|debug:false|timeout:5000'
 * ```
 *
 * @example
 * Property exclusion:
 * ```typescript
 * const userData = {
 *   id: 123,
 *   name: 'Alice',
 *   email: 'alice@example.com',
 *   password: 'secret123',
 *   apiToken: 'abc-xyz-789'
 * };
 *
 * // Exclude sensitive fields
 * const publicData = serializeObject(userData, ['password', 'apiToken']);
 * console.log(publicData); // 'email:alice@example.com|name:Alice|id:123'
 *
 * // Exclude multiple system fields
 * const systemFields = ['createdAt', 'updatedAt', 'version', '_id'];
 * const cleanData = serializeObject(userData, systemFields);
 * ```
 *
 * @example
 * Nested object handling:
 * ```typescript
 * // Objects with nested structures
 * const complexData = {
 *   userId: 456,
 *   preferences: { theme: 'dark', notifications: true },
 *   metadata: { version: '1.0', tags: ['user', 'premium'] }
 * };
 *
 * console.log(serializeObject(complexData));
 * // 'metadata:{"version":"1.0","tags":["user","premium"]}|preferences:{"theme":"dark","notifications":true}|userId:456'
 *
 * // Nested objects are JSON stringified
 * const result = serializeObject({
 *   simple: 'value',
 *   complex: { nested: { deep: 'data' } }
 * });
 * console.log(result); // 'complex:{"nested":{"deep":"data"}}|simple:value'
 * ```
 *
 * @example
 * Non-object value handling:
 * ```typescript
 * // Primitive values fall back to JSON.stringify
 * console.log(serializeObject('hello')); // '"hello"'
 * console.log(serializeObject(42)); // '42'
 * console.log(serializeObject(true)); // 'true'
 * console.log(serializeObject(null)); // 'null'
 * console.log(serializeObject(undefined)); // undefined
 *
 * // Arrays are JSON stringified
 * console.log(serializeObject([1, 2, 3])); // '[1,2,3]'
 * ```
 *
 * @example
 * Cache key generation:
 * ```typescript
 * // Generate cache keys for API requests
 * function generateCacheKey(endpoint: string, params: Record<string, any>) {
 *   const baseKey = `api:${endpoint}`;
 *   const paramKey = serializeObject(params, ['timestamp', 'nonce']);
 *   return `${baseKey}:${paramKey}`;
 * }
 *
 * const cacheKey = generateCacheKey('users', {
 *   page: 1,
 *   limit: 20,
 *   sortBy: 'name',
 *   timestamp: Date.now(),  // Excluded
 *   nonce: Math.random()    // Excluded
 * });
 * console.log(cacheKey); // 'api:users:sortBy:name|limit:20|page:1'
 * ```
 *
 * @example
 * Query parameter serialization:
 * ```typescript
 * // Convert filter objects to query-like strings
 * const filters = {
 *   category: 'electronics',
 *   minPrice: 100,
 *   maxPrice: 500,
 *   inStock: true,
 *   brand: 'TechCorp'
 * };
 *
 * const queryString = serializeObject(filters);
 * console.log(queryString);
 * // 'brand:TechCorp|inStock:true|maxPrice:500|minPrice:100|category:electronics'
 *
 * // Convert to actual URL parameters
 * const urlParams = queryString.split('|').map(pair => {
 *   const [key, value] = pair.split(':');
 *   return `${key}=${encodeURIComponent(value)}`;
 * }).join('&');
 * console.log(urlParams);
 * // 'brand=TechCorp&inStock=true&maxPrice=500&minPrice=100&category=electronics'
 * ```
 *
 * @example
 * Configuration fingerprinting:
 * ```typescript
 * // Create unique identifiers for configurations
 * const dbConfig = {
 *   host: 'localhost',
 *   port: 5432,
 *   database: 'myapp',
 *   ssl: true,
 *   poolSize: 10,
 *   password: 'secret',  // Will be excluded
 *   connectionString: 'postgres://...'  // Will be excluded
 * };
 *
 * const configFingerprint = serializeObject(dbConfig, ['password', 'connectionString']);
 * console.log(configFingerprint);
 * // 'poolSize:10|ssl:true|database:myapp|port:5432|host:localhost'
 *
 * // Use for configuration comparison
 * const isSameConfig = (config1: any, config2: any) => {
 *   const excludeFields = ['password', 'connectionString', 'createdAt'];
 *   return serializeObject(config1, excludeFields) === serializeObject(config2, excludeFields);
 * };
 * ```
 *
 * @remarks
 * **Serialization Format:**
 * - **Delimiter**: Pipe character ('|') separates key-value pairs
 * - **Key-Value**: Colon (':') separates keys from values
 * - **Order**: Uses Object.keys() order (insertion order in modern JS)
 * - **Nested Objects**: JSON stringified using serializeNative
 *
 * **Key Processing:**
 * - Uses getObjectKeys() for consistent key extraction
 * - Supports property exclusion via omits parameter
 * - Processes keys in reverse order (pop() for performance)
 * - Maintains object property enumeration order
 *
 * **Value Processing:**
 * - **Objects**: Recursively JSON stringified
 * - **Primitives**: Direct string conversion
 * - **undefined**: Results in 'key:undefined' pairs
 * - **null**: Results in 'key:null' pairs
 *
 * **Performance Characteristics:**
 * - **Time Complexity**: O(n) where n is number of properties
 * - **Space Complexity**: O(m) where m is total string length
 * - **Optimization**: Pre-allocated array with reverse iteration
 *
 * **Use Cases:**
 * - Cache key generation for memoization
 * - Configuration fingerprinting and comparison
 * - Query parameter serialization
 * - Debugging and logging object states
 * - API request signature generation
 * - Object hashing and identity checking
 *
 * **Function Selection Guide:**
 * ```typescript
 * // serializeObject() - Use for:
 * - Cache keys with readable key-value format
 * - Query parameter-like serialization
 * - Debugging with human-readable output
 * - Property exclusion needs
 *
 * // serializeNative() - Use for:
 * - Standard JSON serialization
 * - API communication
 * - Data persistence
 * - Maximum compatibility
 *
 * // stableSerialize() - Use for:
 * - Deterministic output regardless of property order
 * - Circular reference handling
 * - Complex object fingerprinting
 * - Memoization keys
 *
 * // serializeWithFullSortedKeys() - Use for:
 * - Configuration comparison
 * - Flattened object representation
 * - Debugging nested structures
 * - Alphabetically sorted output
 * ```
 *
 * **Limitations:**
 * - Not suitable for deserialization (one-way transformation)
 * - Pipe and colon characters in values may cause parsing issues
 * - Large nested objects create long strings
 * - No support for circular references in nested objects
 * - Property order depends on JavaScript engine implementation
 */
export const serializeObject = (object: any, omits?: string[]): string => {
  if (!object || typeof object !== 'object') return serializeNative(object);
  const keys = getObjectKeys(object, omits) as string[];
  const segments = new Array(keys.length);
  let key = keys.pop();
  let index = 0;
  while (key) {
    segments[index++] =
      `${key}:${typeof object[key] === 'object' ? serializeNative(object[key]) : object[key]}`;
    key = keys.pop();
  }
  return segments.join('|');
};
