/**
 * Determines whether a value is a Map object with enhanced type safety.
 *
 * Provides reliable Map detection using instanceof check with generic
 * type support for type-safe Map validation and processing. Works with
 * any Map instance regardless of key-value types.
 *
 * @template T - Expected Map type extending Map<any, any>
 * @param value - Value to test for Map type
 * @returns Type-safe boolean indicating whether the value is a Map
 *
 * @example
 * Basic Map detection:
 * ```typescript
 * import { isMap } from '@winglet/common-utils';
 *
 * // True cases - Map instances
 * console.log(isMap(new Map())); // true
 * console.log(isMap(new Map([['key', 'value']]))); // true
 * console.log(isMap(new Map([[1, 'one'], [2, 'two']]))); // true
 *
 * const stringMap = new Map<string, number>();
 * stringMap.set('count', 42);
 * console.log(isMap(stringMap)); // true
 *
 * // False cases - not Map instances
 * console.log(isMap({})); // false (plain object)
 * console.log(isMap({ size: 0, has: () => false })); // false (map-like object)
 * console.log(isMap(new Set())); // false (Set, not Map)
 * console.log(isMap(new WeakMap())); // false (WeakMap, not Map)
 * console.log(isMap([])); // false (array)
 * console.log(isMap('map')); // false (string)
 * console.log(isMap(null)); // false
 * console.log(isMap(undefined)); // false
 * ```
 *
 * @example
 * Type-safe Map processing:
 * ```typescript
 * function processMapData(data: unknown) {
 *   if (isMap(data)) {
 *     // TypeScript knows data is Map
 *     console.log(`Map with ${data.size} entries`);
 *
 *     // Safe to use Map methods
 *     const entries = Array.from(data.entries());
 *     const keys = Array.from(data.keys());
 *     const values = Array.from(data.values());
 *
 *     return {
 *       size: data.size,
 *       entries,
 *       keys,
 *       values,
 *       isEmpty: data.size === 0
 *     };
 *   }
 *
 *   throw new Error('Expected Map instance');
 * }
 *
 * // Usage
 * const userMap = new Map([
 *   ['john', { age: 30, role: 'admin' }],
 *   ['jane', { age: 25, role: 'user' }]
 * ]);
 * const result = processMapData(userMap);
 * console.log('Processed map:', result);
 * ```
 *
 * @example
 * Cache validation:
 * ```typescript
 * interface CacheManager {
 *   cache: unknown;
 * }
 *
 * function validateCache(manager: CacheManager) {
 *   if (!isMap(manager.cache)) {
 *     throw new Error('Cache must be a Map instance');
 *   }
 *
 *   return {
 *     isValid: true,
 *     size: manager.cache.size,
 *     isEmpty: manager.cache.size === 0,
 *
 *     get(key: any) {
 *       return manager.cache.get(key);
 *     },
 *
 *     set(key: any, value: any) {
 *       manager.cache.set(key, value);
 *     },
 *
 *     clear() {
 *       manager.cache.clear();
 *     }
 *   };
 * }
 * ```
 *
 * @example
 * Data structure conversion:
 * ```typescript
 * function convertToObject(mapOrObject: unknown): Record<string, any> {
 *   if (isMap(mapOrObject)) {
 *     const result: Record<string, any> = {};
 *
 *     for (const [key, value] of mapOrObject) {
 *       // Convert key to string for object property
 *       const stringKey = String(key);
 *       result[stringKey] = value;
 *     }
 *
 *     return result;
 *   }
 *
 *   if (typeof mapOrObject === 'object' && mapOrObject !== null) {
 *     return { ...mapOrObject };
 *   }
 *
 *   throw new Error('Expected Map or object');
 * }
 *
 * // Usage
 * const map = new Map([['name', 'John'], ['age', 30]]);
 * const obj = convertToObject(map); // { name: 'John', age: '30' }
 * ```
 *
 * @example
 * Generic Map utilities:
 * ```typescript
 * function mergeMap<K, V>(map1: unknown, map2: unknown): Map<K, V> {
 *   if (!isMap<Map<K, V>>(map1) || !isMap<Map<K, V>>(map2)) {
 *     throw new Error('Both arguments must be Map instances');
 *   }
 *
 *   const result = new Map<K, V>(map1);
 *
 *   for (const [key, value] of map2) {
 *     result.set(key, value);
 *   }
 *
 *   return result;
 * }
 *
 * function mapToArray<K, V>(mapInstance: unknown): Array<[K, V]> {
 *   if (!isMap<Map<K, V>>(mapInstance)) {
 *     throw new Error('Expected Map instance');
 *   }
 *
 *   return Array.from(mapInstance.entries());
 * }
 * ```
 *
 * @example
 * Configuration storage validation:
 * ```typescript
 * interface AppSettings {
 *   userPreferences: unknown;
 *   sessionData: unknown;
 * }
 *
 * function validateAppSettings(settings: AppSettings) {
 *   const errors: string[] = [];
 *
 *   if (!isMap(settings.userPreferences)) {
 *     errors.push('User preferences must be stored in a Map');
 *   }
 *
 *   if (!isMap(settings.sessionData)) {
 *     errors.push('Session data must be stored in a Map');
 *   }
 *
 *   if (errors.length > 0) {
 *     throw new Error(`Settings validation failed: ${errors.join(', ')}`);
 *   }
 *
 *   return {
 *     userPreferences: settings.userPreferences as Map<string, any>,
 *     sessionData: settings.sessionData as Map<string, any>
 *   };
 * }
 * ```
 *
 * @remarks
 * **Key Features:**
 * - Maintains insertion order (unlike plain objects in older JavaScript)
 * - Supports any type as keys (not just strings/symbols)
 * - Built-in iteration methods
 * - Direct size property
 * - Better performance for frequent additions/deletions
 *
 * **Use Cases:**
 * - Cache implementation validation
 * - Data structure type checking
 * - API response validation
 * - Generic collection utilities
 * - Type guards for Map-specific operations
 *
 * **Related Types:**
 * - Use `isWeakMap()` for WeakMap detection
 * - Use `isSet()` for Set detection
 * - Use `isObject()` for general object detection
 * - Use `typeof obj === 'object'` for basic object checking
 *
 * **Performance:** Direct instanceof check provides optimal performance.
 *
 * **Cross-frame Compatibility:** Works correctly across different execution contexts.
 */
export const isMap = <T extends Map<any, any>>(value: unknown): value is T =>
  value instanceof Map;
