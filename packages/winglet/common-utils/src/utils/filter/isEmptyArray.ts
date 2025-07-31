import { isArray } from './isArray';

/**
 * Determines whether a value is an empty array with enhanced type safety.
 *
 * Performs dual validation to ensure the value is both an array and has
 * zero length, providing reliable empty array detection for array
 * processing and validation scenarios.
 *
 * @param value - Value to test for empty array characteristics
 * @returns Type-safe boolean indicating whether the value is an empty array
 *
 * @example
 * Empty array detection:
 * ```typescript
 * import { isEmptyArray } from '@winglet/common-utils';
 *
 * // True cases - empty arrays
 * console.log(isEmptyArray([])); // true
 * console.log(isEmptyArray(new Array())); // true
 * console.log(isEmptyArray(Array.from(''))); // true
 * 
 * // False cases - not empty arrays
 * console.log(isEmptyArray([1, 2, 3])); // false (has elements)
 * console.log(isEmptyArray([undefined])); // false (has one element)
 * console.log(isEmptyArray([''])); // false (has one empty string element)
 * console.log(isEmptyArray(null)); // false (not an array)
 * console.log(isEmptyArray(undefined)); // false (not an array)
 * console.log(isEmptyArray({})); // false (object, not array)
 * console.log(isEmptyArray('')); // false (empty string, not array)
 * console.log(isEmptyArray({ length: 0 })); // false (array-like, not array)
 * ```
 *
 * @example
 * Array processing with empty check:
 * ```typescript
 * function processDataList(data: unknown) {
 *   if (isEmptyArray(data)) {
 *     console.log('No data to process');
 *     return { processed: 0, results: [] };
 *   }
 *   
 *   if (Array.isArray(data)) {
 *     // Process non-empty array
 *     const results = data.map((item, index) => {
 *       return { index, value: item, processed: true };
 *     });
 *     
 *     return { processed: results.length, results };
 *   }
 *   
 *   throw new Error('Expected array data');
 * }
 * ```
 *
 * @example
 * Form validation:
 * ```typescript
 * interface FormData {
 *   tags: unknown;
 *   categories: unknown;
 *   items: unknown;
 * }
 *
 * function validateArrayFields(formData: FormData) {
 *   const errors: string[] = [];
 *   
 *   if (isEmptyArray(formData.tags)) {
 *     errors.push('At least one tag is required');
 *   }
 *   
 *   if (isEmptyArray(formData.categories)) {
 *     errors.push('At least one category must be selected');
 *   }
 *   
 *   if (isEmptyArray(formData.items)) {
 *     errors.push('Items list cannot be empty');
 *   }
 *   
 *   return errors;
 * }
 * ```
 *
 * @example
 * Conditional array operations:
 * ```typescript
 * function safeConcatenate(...arrays: unknown[]): any[] {
 *   const validArrays = arrays.filter(arr => {
 *     return Array.isArray(arr) && !isEmptyArray(arr);
 *   }) as any[][];
 *   
 *   if (validArrays.length === 0) {
 *     console.warn('No valid non-empty arrays to concatenate');
 *     return [];
 *   }
 *   
 *   return validArrays.reduce((result, arr) => result.concat(arr), []);
 * }
 *
 * // Usage
 * console.log(safeConcatenate([1, 2], [], [3, 4], null)); // [1, 2, 3, 4]
 * console.log(safeConcatenate([], '', {})); // []
 * ```
 *
 * @example
 * API response handling:
 * ```typescript
 * interface ApiResponse {
 *   data: unknown;
 *   message: string;
 * }
 *
 * function handleApiResponse(response: ApiResponse) {
 *   if (isEmptyArray(response.data)) {
 *     return {
 *       success: true,
 *       message: 'No data available',
 *       items: [],
 *       count: 0
 *     };
 *   }
 *   
 *   if (Array.isArray(response.data)) {
 *     return {
 *       success: true,
 *       message: 'Data loaded successfully',
 *       items: response.data,
 *       count: response.data.length
 *     };
 *   }
 *   
 *   throw new Error('Expected array data in API response');
 * }
 * ```
 *
 * @remarks
 * **Validation Logic:**
 * 1. First checks if value is an array using `isArray()`
 * 2. Then validates that length property equals 0
 * 3. Both conditions must be true for positive result
 *
 * **Use Cases:**
 * - Form validation (required array fields)
 * - API response validation
 * - Conditional array processing
 * - Default value assignment
 * - Array concatenation utilities
 *
 * **Performance:**
 * - Optimized with early return if not an array
 * - Direct property access for length check
 * - More efficient than `Array.isArray() && array.length === 0`
 *
 * **Related Functions:**
 * - Use `isArray()` for general array detection
 * - Use `isEmptyObject()` for empty object detection
 * - Use `isTruthy()` for general emptiness checks
 */
export const isEmptyArray = (value: unknown): value is any[] =>
  isArray(value) && value.length === 0;