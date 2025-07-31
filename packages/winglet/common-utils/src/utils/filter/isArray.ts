/**
 * Determines whether a value is an array with enhanced type safety.
 *
 * Direct alias for the native Array.isArray method, providing reliable array
 * detection that works correctly across different execution contexts and frames.
 * More reliable than instanceof checks for cross-frame scenarios.
 *
 * @param value - Value to test for array type
 * @returns Type-safe boolean indicating whether the value is an array
 *
 * @example
 * Basic array detection:
 * ```typescript
 * import { isArray } from '@winglet/common-utils';
 *
 * console.log(isArray([1, 2, 3])); // true
 * console.log(isArray([])); // true
 * console.log(isArray(new Array(5))); // true
 * console.log(isArray(Array.from('hello'))); // true
 * console.log(isArray(Array.of(1, 2, 3))); // true
 * 
 * // Non-arrays return false
 * console.log(isArray('string')); // false
 * console.log(isArray({ 0: 'a', 1: 'b', length: 2 })); // false (array-like, but not array)
 * console.log(isArray(0)); // false
 * console.log(isArray(false)); // false
 * console.log(isArray(null)); // false
 * console.log(isArray(undefined)); // false
 * console.log(isArray({})); // false
 * ```
 *
 * @example
 * Type-safe array processing:
 * ```typescript
 * function processInput(input: unknown) {
 *   if (isArray(input)) {
 *     // TypeScript knows input is array
 *     console.log(`Array with ${input.length} elements`);
 *     input.forEach((item, index) => {
 *       console.log(`Item ${index}:`, item);
 *     });
 *     
 *     // Safe to use array methods
 *     const doubled = input.map(item => item * 2);
 *     return doubled;
 *   } else {
 *     console.log('Not an array:', typeof input);
 *     return null;
 *   }
 * }
 * ```
 *
 * @example
 * API response validation:
 * ```typescript
 * interface ApiResponse {
 *   items: unknown;
 *   total: number;
 * }
 *
 * function validateApiResponse(response: unknown): response is ApiResponse {
 *   if (typeof response !== 'object' || response === null) return false;
 *   
 *   const obj = response as Record<string, unknown>;
 *   return isArray(obj.items) && typeof obj.total === 'number';
 * }
 *
 * // Usage
 * fetch('/api/items')
 *   .then(r => r.json())
 *   .then(data => {
 *     if (validateApiResponse(data)) {
 *       console.log(`Found ${data.items.length} items`);
 *       data.items.forEach(processItem);
 *     }
 *   });
 * ```
 *
 * @example
 * Cross-frame array detection:
 * ```typescript
 * // Reliable even when arrays come from different frames/contexts
 * function handleData(data: unknown) {
 *   if (isArray(data)) {
 *     // Works correctly even if data comes from iframe or different window
 *     return data.map(item => processItem(item));
 *   }
 *   throw new Error('Expected array data');
 * }
 * ```
 *
 * @example
 * Generic array utilities:
 * ```typescript
 * function ensureArray<T>(value: T | T[]): T[] {
 *   return isArray(value) ? value : [value];
 * }
 *
 * function flattenDeep(value: unknown): unknown[] {
 *   if (!isArray(value)) return [value];
 *   
 *   return value.reduce((acc: unknown[], item) => {
 *     return acc.concat(flattenDeep(item));
 *   }, []);
 * }
 * ```
 *
 * @remarks
 * **Advantages over alternatives:**
 * - More reliable than `instanceof Array` (works across frames)
 * - More precise than duck typing checks (`obj.length` etc.)
 * - Native performance and compatibility
 * - Handles edge cases like sparse arrays correctly
 * - Works with all array types (typed arrays detected separately)
 *
 * **Use Cases:**
 * - Input validation and type guards
 * - API response validation
 * - Generic data processing functions
 * - Cross-frame array detection
 * - Distinguishing arrays from array-like objects
 *
 * **Note:** This function specifically detects JavaScript arrays. For typed arrays
 * (Uint8Array, Int32Array, etc.), use separate detection methods or `isTypedArray()`.
 */
export const isArray = Array.isArray;
