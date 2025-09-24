/**
 * Retrieves the first enumerable property key from an object.
 *
 * Returns the first key encountered during iteration over the object's
 * enumerable properties using a for-in loop. This includes both own
 * properties and inherited properties from the prototype chain. Returns
 * undefined if the object has no enumerable properties.
 *
 * @param object - The object to get the first key from
 * @returns The first enumerable property key, or undefined if object is empty
 *
 * @example
 * Basic usage with plain objects:
 * ```typescript
 * import { getFirstKey } from '@winglet/common-utils';
 *
 * // Object with multiple properties
 * const user = { id: 1, name: 'Alice', email: 'alice@example.com' };
 * const firstKey = getFirstKey(user);
 * console.log(firstKey); // 'id' (typically, but order not guaranteed)
 *
 * // Empty object
 * console.log(getFirstKey({})); // undefined
 *
 * // Single property object
 * const single = { onlyKey: 'value' };
 * console.log(getFirstKey(single)); // 'onlyKey'
 * ```
 *
 * @example
 * Quick emptiness check:
 * ```typescript
 * function isEmpty(obj: Record<string, any>): boolean {
 *   return getFirstKey(obj) === undefined;
 * }
 *
 * console.log(isEmpty({})); // true
 * console.log(isEmpty({ a: 1 })); // false
 *
 * // More efficient than Object.keys for emptiness check
 * const largeObject = Object.fromEntries(
 *   Array.from({ length: 10000 }, (_, i) => [`key${i}`, i])
 * );
 *
 * // getFirstKey stops at first property
 * console.time('getFirstKey');
 * isEmpty(largeObject); // ~0.001ms
 * console.timeEnd('getFirstKey');
 *
 * // Object.keys creates full array
 * console.time('Object.keys');
 * Object.keys(largeObject).length === 0; // ~2ms
 * console.timeEnd('Object.keys');
 * ```
 *
 * @example
 * Working with inherited properties:
 * ```typescript
 * const parent = { inheritedKey: 'inherited value' };
 * const child = Object.create(parent);
 * child.ownKey = 'own value';
 *
 * // Returns first key (could be own or inherited)
 * const first = getFirstKey(child);
 * console.log(first); // 'ownKey' or 'inheritedKey' (order varies)
 *
 * // To get only own property first key
 * function getFirstOwnKey(obj: Record<string, any>) {
 *   for (const key in obj) {
 *     if (obj.hasOwnProperty(key)) return key;
 *   }
 *   return undefined;
 * }
 * console.log(getFirstOwnKey(child)); // 'ownKey'
 * ```
 *
 * @example
 * Getting a sample property for type checking:
 * ```typescript
 * function inferValueType(data: Record<string, any>) {
 *   const firstKey = getFirstKey(data);
 *
 *   if (firstKey === undefined) {
 *     return 'empty';
 *   }
 *
 *   const firstValue = data[firstKey];
 *   return typeof firstValue;
 * }
 *
 * console.log(inferValueType({ a: 1, b: 2 })); // 'number'
 * console.log(inferValueType({ x: 'hello' })); // 'string'
 * console.log(inferValueType({})); // 'empty'
 * ```
 *
 * @example
 * Processing single-property objects:
 * ```typescript
 * function processSingleProp(obj: Record<string, any>) {
 *   const key = getFirstKey(obj);
 *
 *   if (key === undefined) {
 *     throw new Error('Object is empty');
 *   }
 *
 *   // For single-property objects, first key is the only key
 *   return { key, value: obj[key] };
 * }
 *
 * const result = processSingleProp({ status: 'active' });
 * console.log(result); // { key: 'status', value: 'active' }
 * ```
 *
 * @example
 * Object with numeric keys:
 * ```typescript
 * // Numeric keys are converted to strings
 * const numericKeys = {
 *   0: 'zero',
 *   1: 'one',
 *   2: 'two'
 * };
 *
 * console.log(getFirstKey(numericKeys)); // '0' (string, not number)
 *
 * // Mixed numeric and string keys
 * const mixed = {
 *   2: 'two',
 *   0: 'zero',
 *   'a': 'letter',
 *   1: 'one'
 * };
 *
 * // Numeric keys typically come first in ascending order
 * console.log(getFirstKey(mixed)); // '0' (typically)
 * ```
 *
 * @remarks
 * **Key Order Considerations:**
 * - ES2015+ maintains insertion order for string keys
 * - Numeric keys are ordered numerically (0, 1, 2, ...)
 * - Symbol keys are ordered by insertion after string keys
 * - Order may vary in older JavaScript engines
 * - Inherited properties appear after own properties
 *
 * **Performance Characteristics:**
 * - Time Complexity: O(1) best case (has properties)
 * - Time Complexity: O(n) worst case (empty object with long prototype chain)
 * - Space Complexity: O(1) constant space
 * - Stops immediately at first property found
 * - Much faster than Object.keys()[0] for non-empty objects
 *
 * **Use Cases:**
 * - Quick emptiness checks
 * - Getting sample key for validation
 * - Processing single-property objects
 * - Early exit conditions in iterations
 * - Performance-critical first key access
 *
 * **Limitations:**
 * - Property order is not guaranteed in all environments
 * - Includes inherited properties (use hasOwnProperty to filter)
 * - Returns string even for numeric property names
 * - No way to get first Symbol key (symbols not enumerable in for-in)
 *
 * **Alternative Approaches:**
 * ```typescript
 * // Using Object.keys (creates array)
 * const firstKey = Object.keys(object)[0];
 *
 * // Using Object.entries
 * const [[firstKey]] = Object.entries(object);
 *
 * // Using Reflect.ownKeys (includes symbols)
 * const firstKey = Reflect.ownKeys(object)[0];
 * ```
 *
 * @see {@link countKey} for counting all enumerable properties
 * @see {@link getObjectKeys} for getting all own property keys
 * @see {@link countObjectKey} for counting only own properties
 */
export const getFirstKey = (object: Record<string, any>) => {
  for (const key in object) return key;
  return undefined;
};
