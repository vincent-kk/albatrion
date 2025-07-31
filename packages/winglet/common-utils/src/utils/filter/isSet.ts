/**
 * Determines whether a value is a Set object with enhanced type safety.
 *
 * Provides reliable Set detection using instanceof check with generic
 * type support for type-safe Set validation and processing. Works with
 * any Set instance regardless of the stored value types.
 *
 * @template T - Expected Set type extending Set<any>
 * @param value - Value to test for Set type
 * @returns Type-safe boolean indicating whether the value is a Set
 *
 * @example
 * Basic Set detection:
 * ```typescript
 * import { isSet } from '@winglet/common-utils';
 *
 * // True cases - Set instances
 * console.log(isSet(new Set())); // true
 * console.log(isSet(new Set([1, 2, 3]))); // true
 * console.log(isSet(new Set(['a', 'b', 'c']))); // true
 * 
 * const numberSet = new Set<number>();
 * numberSet.add(42);
 * console.log(isSet(numberSet)); // true
 * 
 * // False cases - not Set instances
 * console.log(isSet([])); // false (array)
 * console.log(isSet({})); // false (plain object)
 * console.log(isSet(new Map())); // false (Map, not Set)
 * console.log(isSet(new WeakSet())); // false (WeakSet, not Set)
 * console.log(isSet({ size: 0, has: () => false })); // false (set-like object)
 * console.log(isSet('set')); // false (string)
 * console.log(isSet(null)); // false
 * console.log(isSet(undefined)); // false
 * ```
 *
 * @example
 * Type-safe Set processing:
 * ```typescript
 * function processSetData(data: unknown) {
 *   if (isSet(data)) {
 *     // TypeScript knows data is Set
 *     console.log(`Set with ${data.size} unique values`);
 *     
 *     // Safe to use Set methods
 *     const values = Array.from(data.values());
 *     const hasSpecificValue = data.has('target');
 *     
 *     return {
 *       size: data.size,
 *       values,
 *       isEmpty: data.size === 0,
 *       hasTarget: hasSpecificValue
 *     };
 *   }
 *   
 *   throw new Error('Expected Set instance');
 * }
 *
 * // Usage
 * const tagSet = new Set(['javascript', 'typescript', 'react']);
 * const result = processSetData(tagSet);
 * console.log('Processed set:', result);
 * ```
 *
 * @example
 * Unique value validation:
 * ```typescript
 * interface CollectionManager {
 *   uniqueItems: unknown;
 * }
 *
 * function validateUniqueCollection(manager: CollectionManager) {
 *   if (!isSet(manager.uniqueItems)) {
 *     throw new Error('Unique items must be stored in a Set');
 *   }
 *   
 *   return {
 *     isValid: true,
 *     count: manager.uniqueItems.size,
 *     isEmpty: manager.uniqueItems.size === 0,
 *     
 *     add(item: any) {
 *       manager.uniqueItems.add(item);
 *       return this;
 *     },
 *     
 *     remove(item: any) {
 *       manager.uniqueItems.delete(item);
 *       return this;
 *     },
 *     
 *     contains(item: any) {
 *       return manager.uniqueItems.has(item);
 *     }
 *   };
 * }
 * ```
 *
 * @example
 * Data structure conversion:
 * ```typescript
 * function convertToArray(setOrArray: unknown): any[] {
 *   if (isSet(setOrArray)) {
 *     // Convert Set to Array maintaining uniqueness
 *     return Array.from(setOrArray);
 *   }
 *   
 *   if (Array.isArray(setOrArray)) {
 *     return [...setOrArray];
 *   }
 *   
 *   throw new Error('Expected Set or Array');
 * }
 *
 * function ensureUniqueValues(arrayOrSet: unknown): Set<any> {
 *   if (isSet(arrayOrSet)) {
 *     return new Set(arrayOrSet); // Create copy
 *   }
 *   
 *   if (Array.isArray(arrayOrSet)) {
 *     return new Set(arrayOrSet); // Remove duplicates
 *   }
 *   
 *   throw new Error('Expected Set or Array');
 * }
 *
 * // Usage
 * const numbers = [1, 2, 2, 3, 3, 4];
 * const uniqueNumbers = ensureUniqueValues(numbers);
 * console.log(convertToArray(uniqueNumbers)); // [1, 2, 3, 4]
 * ```
 *
 * @remarks
 * **Key Features:**
 * - Maintains insertion order (like Map)
 * - Automatic duplicate removal
 * - Direct size property
 * - Efficient add/delete/has operations
 * - Iterable interface support
 *
 * **Use Cases:**
 * - Unique value collections
 * - Permission/role systems
 * - Tag management
 * - Data deduplication
 * - Graph algorithms (visited nodes)
 * - Cache key management
 *
 * **Related Types:**
 * - Use `isWeakSet()` for WeakSet detection
 * - Use `isMap()` for Map detection
 * - Use `isArray()` for array detection
 * - Use `typeof obj === 'object'` for basic object checking
 *
 * **Performance:** Direct instanceof check provides optimal performance.
 *
 * **Cross-frame Compatibility:** Works correctly across different execution contexts.
 */
export const isSet = <T extends Set<any>>(value: unknown): value is T =>
  value instanceof Set;