/**
 * Determines whether a value has an array-like structure.
 *
 * Identifies objects that behave like arrays by having a numeric length property
 * and indexed access, but may not be actual Array instances. Performs comprehensive
 * validation including length property and index accessibility checks.
 *
 * @param value - Value to test for array-like characteristics
 * @returns Type-safe boolean indicating whether the value is array-like
 *
 * @example
 * Array-like objects detection:
 * ```typescript
 * import { isArrayLike } from '@winglet/common-utils';
 *
 * // True cases - array-like structures
 * console.log(isArrayLike([1, 2, 3])); // true (actual array)
 * console.log(isArrayLike('hello')); // true (string has length and indices)
 * console.log(isArrayLike({ 0: 'a', 1: 'b', length: 2 })); // true
 * console.log(isArrayLike({ length: 0 })); // true (empty array-like)
 *
 * // Arguments object (in non-arrow functions)
 * function testArgs() {
 *   console.log(isArrayLike(arguments)); // true
 * }
 *
 * // NodeList, HTMLCollection (in browser)
 * console.log(isArrayLike(document.querySelectorAll('div'))); // true
 *
 * // False cases - not array-like
 * console.log(isArrayLike(null)); // false
 * console.log(isArrayLike(undefined)); // false
 * console.log(isArrayLike({})); // false (no length property)
 * console.log(isArrayLike({ length: 'not a number' })); // false
 * console.log(isArrayLike({ length: 2 })); // false (no indexed access)
 * console.log(isArrayLike({ 0: 'a', length: 1, 1: 'missing' })); // false
 * ```
 *
 * @example
 * Converting array-like to array:
 * ```typescript
 * function toArray<T>(arrayLike: unknown): T[] {
 *   if (isArrayLike(arrayLike)) {
 *     // TypeScript knows arrayLike has length and indexed access
 *     return Array.from(arrayLike as ArrayLike<T>);
 *   }
 *
 *   throw new Error('Value is not array-like');
 * }
 *
 * // Usage
 * const nodeList = document.querySelectorAll('.item');
 * const nodesArray = toArray<Element>(nodeList);
 * ```
 *
 * @example
 * Generic iteration over array-like objects:
 * ```typescript
 * function processArrayLike(data: unknown, processor: (item: any) => void) {
 *   if (isArrayLike(data)) {
 *     for (let i = 0; i < data.length; i++) {
 *       processor(data[i]);
 *     }
 *   } else {
 *     console.warn('Data is not array-like, cannot iterate');
 *   }
 * }
 *
 * // Usage with different array-like structures
 * processArrayLike('hello', char => console.log(char)); // h, e, l, l, o
 * processArrayLike([1, 2, 3], num => console.log(num * 2)); // 2, 4, 6
 * ```
 *
 * @example
 * Function arguments processing:
 * ```typescript
 * function flexibleFunction(...args: any[]) {
 *   function processArgs(argumentsObj: unknown) {
 *     if (isArrayLike(argumentsObj)) {
 *       console.log(`Received ${argumentsObj.length} arguments`);
 *
 *       // Convert to proper array for array methods
 *       const argsArray = Array.from(argumentsObj as ArrayLike<any>);
 *       return argsArray.map(arg => String(arg).toUpperCase());
 *     }
 *
 *     return [];
 *   }
 *
 *   return processArgs(arguments);
 * }
 * ```
 *
 * @remarks
 * **Detection Criteria:**
 * 1. Must be non-null object
 * 2. Must have 'length' property of type number
 * 3. If length > 0, must have indexed access to `length - 1`
 * 4. Empty array-like objects (length === 0) are valid
 *
 * **Common Array-like Objects:**
 * - JavaScript Arrays
 * - Strings
 * - Arguments object
 * - NodeList, HTMLCollection (browser)
 * - TypedArrays (Uint8Array, etc.)
 * - Custom objects with length and indexed properties
 *
 * **Use Cases:**
 * - Generic iteration utilities
 * - Function argument processing
 * - DOM element collection handling
 * - Legacy browser compatibility layers
 * - Array method polyfills
 *
 * **Performance:** Optimized with early returns and minimal property access.
 */
export const isArrayLike = (value: unknown): value is ArrayLike<unknown> =>
  value !== null &&
  typeof value === 'object' &&
  'length' in value &&
  typeof value.length === 'number' &&
  (value.length === 0 || value.length - 1 in value);
