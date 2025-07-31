/**
 * Determines whether a value is an object (excluding null, primitives, and functions).
 *
 * Provides reliable object detection by checking for non-null object types,
 * distinguishing true objects from primitives and functions while correctly 
 * handling the JavaScript quirk where typeof null === 'object'.
 *
 * @param value - Value to test for object type
 * @returns Type-safe boolean indicating whether the value is an object
 *
 * @example
 * Basic object detection:
 * ```typescript
 * import { isObject } from '@winglet/common-utils';
 *
 * console.log(isObject({})); // true
 * console.log(isObject({ name: 'John' })); // true
 * console.log(isObject([1, 2, 3])); // true (arrays are objects)
 * console.log(isObject(new Date())); // true
 * console.log(isObject(/regex/)); // true
 * console.log(isObject(new Map())); // true
 * console.log(isObject(new Set())); // true
 * console.log(isObject(Object.create(null))); // true
 * 
 * // These return false
 * console.log(isObject(null)); // false (important distinction)
 * console.log(isObject(() => {})); // false (functions are excluded)
 * console.log(isObject(function() {})); // false (functions are excluded)
 * console.log(isObject('string')); // false
 * console.log(isObject(42)); // false
 * console.log(isObject(true)); // false
 * console.log(isObject(undefined)); // false
 * console.log(isObject(Symbol('test'))); // false
 * ```
 *
 * @example
 * Object processing with type safety:
 * ```typescript
 * function processData(input: unknown) {
 *   if (isObject(input)) {
 *     // TypeScript knows input is object (but not function)
 *     console.log('Processing object:', Object.keys(input));
 *     
 *     // Safe to use object methods
 *     if ('toString' in input) {
 *       console.log('String representation:', input.toString());
 *     }
 *   } else {
 *     console.log('Not an object:', typeof input, input);
 *   }
 * }
 * ```
 *
 * @example
 * API response validation:
 * ```typescript
 * interface ApiResponse {
 *   data: unknown;
 *   status: number;
 *   message: string;
 * }
 *
 * function validateApiResponse(response: unknown): response is ApiResponse {
 *   return isObject(response) && 
 *          'data' in response &&
 *          'status' in response &&
 *          'message' in response;
 * }
 *
 * // Usage
 * fetch('/api/data')
 *   .then(r => r.json())
 *   .then(data => {
 *     if (validateApiResponse(data)) {
 *       console.log('Valid response:', data.status);
 *     }
 *   });
 * ```
 *
 * @remarks
 * **Important Notes:**
 * - Returns `true` for arrays, dates, regexes, maps, sets, and other object types
 * - Returns `false` for `null` (unlike raw `typeof` check)
 * - Returns `false` for all primitive types
 * - Returns `false` for functions (unlike raw `typeof` check)
 * - Does not distinguish between plain objects and instances
 *
 * **Use Cases:**
 * - Input validation for object-like data (excluding functions)
 * - Type guards before property access
 * - API response validation
 * - Generic object processing functions
 *
 * For more specific object type checking, consider:
 * - `isPlainObject()` for plain data objects
 * - `isArray()` for arrays specifically
 * - `isFunction()` for functions specifically
 * - `instanceof` for specific class instances
 */
export const isObject = (value?: unknown): value is object =>
  value !== null && typeof value === 'object';
