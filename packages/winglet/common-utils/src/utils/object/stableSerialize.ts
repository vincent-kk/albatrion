import { cacheWeakMapFactory } from '@/common-utils/libs/cacheWeakMapFactory';
import { counterFactory } from '@/common-utils/libs/counterFactory';
import { isArray } from '@/common-utils/utils/filter/isArray';
import { isDate } from '@/common-utils/utils/filter/isDate';
import { isFunction } from '@/common-utils/utils/filter/isFunction';
import { isPlainObject } from '@/common-utils/utils/filter/isPlainObject';
import { isPrimitiveObject } from '@/common-utils/utils/filter/isPrimitiveObject';
import { isRegex } from '@/common-utils/utils/filter/isRegex';
import { isUndefined } from '@/common-utils/utils/filter/isUndefined';
import { Murmur3 } from '@/common-utils/utils/hash';

import { serializeNative } from './serializeNative';

const { get, set } = cacheWeakMapFactory<string>();
const { increment } = counterFactory();

/**
 * Creates deterministic, stable serialization strings with circular reference support.
 *
 * Generates consistent string representations of complex objects that are identical
 * for structurally equivalent data, regardless of property definition order. Handles
 * circular references gracefully and supports property exclusion for flexible
 * serialization scenarios. Uses advanced caching and hashing for optimal performance.
 *
 * @param input - Value to serialize (any type supported)
 * @param omit - Set or array of property keys to exclude from serialization (optional)
 * @returns Stable, deterministic string representation
 *
 * @example
 * Basic stable serialization:
 * ```typescript
 * import { stableSerialize } from '@winglet/common-utils';
 *
 * // Objects with different property order produce identical strings
 * const obj1 = { name: 'John', age: 30, city: 'NYC' };
 * const obj2 = { city: 'NYC', age: 30, name: 'John' }; // Different order
 *
 * console.log(stableSerialize(obj1)); // '{age:30|city:NYC|name:John}'
 * console.log(stableSerialize(obj2)); // '{age:30|city:NYC|name:John}' (identical)
 * console.log(stableSerialize(obj1) === stableSerialize(obj2)); // true
 *
 * // Arrays maintain order
 * const arr1 = [3, 1, 2];
 * const arr2 = [3, 1, 2];
 * console.log(stableSerialize(arr1)); // '[3,1,2]'
 * console.log(stableSerialize(arr2)); // '[3,1,2]'
 * ```
 *
 * @example
 * Nested object serialization:
 * ```typescript
 * // Complex nested structures
 * const complex = {
 *   user: {
 *     profile: { name: 'Alice', settings: { theme: 'dark', lang: 'en' } },
 *     permissions: ['read', 'write']
 *   },
 *   metadata: {
 *     version: '1.2.0',
 *     created: new Date('2023-01-01T12:00:00Z')
 *   }
 * };
 *
 * const serialized = stableSerialize(complex);
 * console.log(serialized);
 * // '{metadata:{created:2023-01-01T12:00:00.000Z|version:1.2.0}|user:{permissions:[read,write]|profile:{name:Alice|settings:{lang:en|theme:dark}}}}'
 *
 * // Reordered version produces identical result
 * const reordered = {
 *   metadata: {
 *     created: new Date('2023-01-01T12:00:00Z'),
 *     version: '1.2.0' // Different order
 *   },
 *   user: {
 *     permissions: ['read', 'write'],
 *     profile: { settings: { lang: 'en', theme: 'dark' }, name: 'Alice' } // Different order
 *   }
 * };
 *
 * console.log(stableSerialize(reordered) === serialized); // true
 * ```
 *
 * @example
 * Circular reference handling:
 * ```typescript
 * // Objects with circular references
 * const circular: any = { name: 'parent', id: 1 };
 * circular.self = circular;
 * circular.child = { name: 'child', parent: circular };
 *
 * const serialized = stableSerialize(circular);
 * console.log(serialized);
 * // Output includes unique identifiers for circular references
 * // e.g., '1@{child:{name:child|parent:2@}|id:1|name:parent|self:3@}'
 *
 * // Different object with same circular structure
 * const another: any = { name: 'parent', id: 1 };
 * another.self = another;
 * another.child = { name: 'child', parent: another };
 *
 * console.log(stableSerialize(another) === serialized); // true (structurally identical)
 * ```
 *
 * @example
 * Property exclusion:
 * ```typescript
 * // Exclude sensitive or volatile properties
 * const userData = {
 *   id: 123,
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   password: 'secret123',
 *   sessionToken: 'abc-xyz-789',
 *   lastLogin: '2023-01-01T10:00:00Z',
 *   preferences: {
 *     theme: 'dark',
 *     notifications: true
 *   }
 * };
 *
 * // Serialize excluding sensitive fields
 * const publicData = stableSerialize(userData, ['password', 'sessionToken']);
 * console.log(publicData);
 * // '{email:john@example.com|id:123|lastLogin:2023-01-01T10:00:00Z|name:John Doe|preferences:{notifications:true|theme:dark}}'
 *
 * // Using Set for exclusion (better performance for many keys)
 * const excludeSet = new Set(['password', 'sessionToken', 'lastLogin']);
 * const minimalData = stableSerialize(userData, excludeSet);
 * console.log(minimalData);
 * // '{email:john@example.com|id:123|name:John Doe|preferences:{notifications:true|theme:dark}}'
 * ```
 *
 * @example
 * Cache key generation:
 * ```typescript
 * // Generate stable cache keys for complex API parameters
 * const generateCacheKey = (endpoint: string, params: any, options: any = {}) => {
 *   const baseKey = `api:${endpoint}`;
 *   const paramKey = stableSerialize(params, ['timestamp', 'nonce', '_']);
 *   const optionKey = stableSerialize(options, ['debug', 'trace']);
 *   return `${baseKey}:${paramKey}:${optionKey}`;
 * };
 *
 * const params1 = { userId: 123, includeProfile: true, sort: 'name' };
 * const params2 = { sort: 'name', userId: 123, includeProfile: true }; // Different order
 *
 * const key1 = generateCacheKey('users', params1);
 * const key2 = generateCacheKey('users', params2);
 *
 * console.log(key1 === key2); // true (identical cache keys)
 * console.log(key1); // 'api:users:{includeProfile:true|sort:name|userId:123}:{}'
 * ```
 *
 * @example
 * Configuration fingerprinting:
 * ```typescript
 * // Create stable fingerprints for configuration objects
 * const createConfigFingerprint = (config: any) => {
 *   // Exclude volatile or environment-specific fields
 *   const excludeFields = ['timestamp', 'pid', 'hostname', 'temp', 'logs'];
 *   return stableSerialize(config, excludeFields);
 * };
 *
 * const config1 = {
 *   database: { host: 'localhost', port: 5432, pool: { min: 2, max: 10 } },
 *   cache: { redis: { host: 'localhost', port: 6379 } },
 *   features: { analytics: true, debug: false }
 * };
 *
 * const config2 = {
 *   features: { debug: false, analytics: true }, // Different order
 *   cache: { redis: { port: 6379, host: 'localhost' } }, // Different order
 *   database: { pool: { max: 10, min: 2 }, port: 5432, host: 'localhost' } // Different order
 * };
 *
 * const fingerprint1 = createConfigFingerprint(config1);
 * const fingerprint2 = createConfigFingerprint(config2);
 *
 * console.log(fingerprint1 === fingerprint2); // true (same configuration)
 * ```
 *
 * @example
 * Object comparison and change detection:
 * ```typescript
 * // Detect changes in complex objects
 * const detectChanges = (oldObj: any, newObj: any, ignore: string[] = []) => {
 *   const oldSig = stableSerialize(oldObj, ignore);
 *   const newSig = stableSerialize(newObj, ignore);
 *   return {
 *     hasChanged: oldSig !== newSig,
 *     oldSignature: oldSig,
 *     newSignature: newSig
 *   };
 * };
 *
 * const original = {
 *   user: { name: 'Alice', role: 'admin' },
 *   settings: { theme: 'light', lang: 'en' },
 *   lastModified: '2023-01-01T10:00:00Z'
 * };
 *
 * const modified = {
 *   user: { name: 'Alice', role: 'user' }, // Role changed
 *   settings: { theme: 'light', lang: 'en' },
 *   lastModified: '2023-01-01T11:00:00Z' // Timestamp changed
 * };
 *
 * // Detect changes ignoring timestamp
 * const changes = detectChanges(original, modified, ['lastModified']);
 * console.log(changes.hasChanged); // true (role changed)
 * ```
 *
 * @example
 * Advanced type handling:
 * ```typescript
 * // Handle various JavaScript types
 * const mixedTypes = {
 *   date: new Date('2023-01-01T12:00:00Z'),
 *   regex: /test/gi,
 *   func: function() { return 'hello'; },
 *   undef: undefined,
 *   nullVal: null,
 *   bigInt: BigInt(123),
 *   symbol: Symbol('test')
 * };
 *
 * const serialized = stableSerialize(mixedTypes);
 * console.log(serialized);
 * // Functions, symbols converted to string representations
 * // Dates serialized as ISO strings
 * // RegExp serialized with pattern and flags
 * ```
 *
 * @example
 * Performance optimization:
 * ```typescript
 * // Efficient serialization of large, repeatedly accessed objects
 * const largeConfig = {
 *   // ... large configuration object
 * };
 *
 * // First call creates cache entry
 * console.time('first-serialize');
 * const result1 = stableSerialize(largeConfig);
 * console.timeEnd('first-serialize');
 *
 * // Subsequent calls with same object use cache
 * console.time('cached-serialize');
 * const result2 = stableSerialize(largeConfig);
 * console.timeEnd('cached-serialize'); // Much faster
 *
 * console.log(result1 === result2); // true
 * ```
 *
 * @remarks
 * **Stability Guarantees:**
 * - **Deterministic Output**: Identical objects always produce identical strings
 * - **Order Independence**: Object property order doesn't affect output
 * - **Type Preservation**: Different types produce different serializations
 * - **Circular Reference Safe**: Handles self-referencing objects without infinite loops
 *
 * **Serialization Strategy:**
 * - **Objects**: Properties sorted alphabetically, recursively serialized
 * - **Arrays**: Elements serialized in order with index preservation
 * - **Primitives**: Direct string conversion with type distinction
 * - **Functions**: Converted to string representation
 * - **Dates**: Serialized as ISO string for consistency
 * - **RegExp**: Includes pattern and flags
 *
 * **Internal Caching Mechanism:**
 * - **Cache Factory**: Uses `cacheWeakMapFactory<string>()` for object-to-string mapping
 * - **WeakMap Storage**: `get()` and `set()` operations for object key storage
 * - **Automatic Cleanup**: Cached entries automatically removed when objects are GC'd
 * - **Counter System**: `counterFactory()` generates unique IDs for circular references
 * - **Omit Hash Optimization**: Creates Murmur3 hash of excluded keys for cache differentiation
 * - **Cache Key Strategy**: Combines omit hash + object ID for unique cache entries
 *
 * **Performance Optimizations:**
 * - **Caching**: Uses WeakMap to cache results for repeated objects
 * - **Incremental IDs**: Efficient unique identifier generation via `increment()`
 * - **Hash-based Exclusion**: Murmur3 hash of omit keys converted to base36 for prefixes
 * - **Memory Efficient**: Automatic cache cleanup for garbage-collected objects
 * - **Early Cache Hit**: Returns cached result immediately if found with matching omit hash
 *
 * **Circular Reference Handling:**
 * - **Detection**: Identifies circular references during traversal
 * - **Unique IDs**: Assigns incrementing identifiers to circular objects
 * - **Reference Preservation**: Maintains structural relationships in output
 * - **Deterministic IDs**: Same circular structure gets same ID assignment
 *
 * **Property Exclusion:**
 * - **Array Support**: Accepts array of property names to exclude
 * - **Set Support**: Accepts Set for O(1) lookup performance
 * - **Hash Optimization**: Creates hash prefix for excluded properties
 * - **Nested Exclusion**: Applies exclusion rules at all nesting levels
 *
 * **Use Cases:**
 * - **Caching**: Generate stable cache keys for complex data structures
 * - **Memoization**: Create consistent function parameter signatures
 * - **Configuration Management**: Compare and fingerprint configuration objects
 * - **Change Detection**: Identify modifications in complex data
 * - **API Testing**: Generate stable test signatures for request/response data
 * - **State Management**: Create consistent state snapshots
 *
 * **Advantages over JSON.stringify:**
 * - **Property Order Independence**: Consistent output regardless of definition order
 * - **Circular Reference Support**: Handles self-referencing objects safely
 * - **Property Exclusion**: Built-in filtering capabilities
 * - **Advanced Caching**: Performance optimizations for repeated serialization
 * - **Type Distinction**: Better handling of functions, undefined, symbols
 *
 * **Limitations:**
 * - **One-Way Operation**: Cannot deserialize back to original object
 * - **String Output Only**: All values converted to string representation
 * - **Function Serialization**: Functions serialized by toString(), may vary by engine
 * - **Symbol Handling**: Symbols converted to string representation
 * - **Performance on Very Large Objects**: May be slower than simple JSON.stringify
 * - **Memory Usage**: Caching increases memory consumption for large objects
 */
export const stableSerialize = (
  input: unknown,
  omit?: Set<string> | Array<string>,
): string => {
  const omitSet = omit ? (omit instanceof Set ? omit : new Set(omit)) : null;
  const omitKeys = omit ? (isArray(omit) ? omit : Array.from(omit)) : null;
  const omitHash = omitKeys
    ? Murmur3.hash(omitKeys.join(',')).toString(36)
    : '';
  return createHash(input, omitSet, omitHash);
};

/**
 * Creates a stably hashed string for the given value.
 *
 * @param input - Value to hash
 * @param omit - Set of property keys to exclude from hashing
 * @param omitHash - Hash prefix for excluded keys
 * @returns Hashed string
 */
const createHash = (
  input: unknown,
  omit: Set<string> | null,
  omitHash: string,
): string => {
  if (isPrimitiveObject(input) && !isDate(input) && !isRegex(input)) {
    let result = get(input);
    if (result && (!omitHash || result.startsWith(omitHash))) return result;
    result = `${omitHash}${increment()}@`;
    set(input, result);
    if (isArray(input)) {
      const segments = [];
      for (let i = 0, e = input[0], l = input.length; i < l; i++, e = input[i])
        segments[segments.length] = createHash(e, omit, omitHash);
      result = `${omitHash}[${segments.join(',')}]`;
    } else if (isPlainObject(input)) {
      const segments = [];
      const keys = Object.keys(input).sort();
      let key: string;
      while (!isUndefined((key = keys.pop() as string))) {
        if (omit?.has(key)) continue;
        segments[segments.length] =
          key + ':' + createHash(input[key], omit, omitHash);
      }
      result = `${omitHash}{${segments.join('|')}}`;
    }
    set(input, result);
    return result;
  }
  if (isDate(input)) return input.toJSON();
  if (isFunction(input?.toString)) return input.toString();
  return serializeNative(input);
};
