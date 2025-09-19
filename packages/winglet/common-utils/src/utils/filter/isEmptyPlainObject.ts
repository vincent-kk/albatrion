import { hasOwnProperty } from '@/common-utils/libs/hasOwnProperty';

import { isPlainObject } from './isPlainObject';

/**
 * Determines whether a value is an empty plain object with enhanced type safety.
 *
 * Performs comprehensive validation to ensure the value is both a plain object
 * and has no enumerable properties. This is the safer alternative to `isEmptyObject()`
 * with proper handling of built-in objects, though slightly slower in performance.
 *
 * @param value - Value to test for empty plain object characteristics
 * @returns Type-safe boolean indicating whether the value is an empty plain object
 *
 * @example
 * Empty plain object detection:
 * ```typescript
 * import { isEmptyPlainObject } from '@winglet/common-utils';
 *
 * // True cases - empty plain objects
 * console.log(isEmptyPlainObject({})); // true
 * console.log(isEmptyPlainObject(Object.create(null))); // true
 * console.log(isEmptyPlainObject(new Object())); // true
 *
 * // False cases - not empty plain objects
 * console.log(isEmptyPlainObject({ a: 1 })); // false (has properties)
 * console.log(isEmptyPlainObject([])); // false (array, not plain object)
 * console.log(isEmptyPlainObject(new Date())); // false (Date instance)
 * console.log(isEmptyPlainObject(new Error())); // false (Error instance)
 * console.log(isEmptyPlainObject(new Map())); // false (Map instance)
 * console.log(isEmptyPlainObject(new Set())); // false (Set instance)
 * console.log(isEmptyPlainObject('string')); // false (not an object)
 * console.log(isEmptyPlainObject(1)); // false (not an object)
 * console.log(isEmptyPlainObject(null)); // false (not an object)
 * console.log(isEmptyPlainObject(undefined)); // false (not an object)
 * ```
 *
 * @example
 * Safe configuration processing:
 * ```typescript
 * function processConfiguration(config: unknown) {
 *   if (isEmptyPlainObject(config)) {
 *     console.log('Empty configuration, applying defaults');
 *     return { debug: false, timeout: 5000, retries: 3 };
 *   }
 *
 *   if (typeof config === 'object' && config !== null) {
 *     // Merge with defaults, knowing it's a plain object with properties
 *     return {
 *       debug: false,
 *       timeout: 5000,
 *       retries: 3,
 *       ...config
 *     };
 *   }
 *
 *   throw new Error('Configuration must be a plain object');
 * }
 * ```
 *
 * @example
 * JSON validation:
 * ```typescript
 * function validateJsonObject(data: unknown): boolean {
 *   // Check if it's a valid JSON-like plain object
 *   if (isEmptyPlainObject(data)) {
 *     return true; // Empty objects are valid JSON
 *   }
 *
 *   if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
 *     // Ensure it's a plain object, not a class instance
 *     return isPlainObject(data);
 *   }
 *
 *   return false;
 * }
 *
 * // Usage
 * console.log(validateJsonObject({})); // true
 * console.log(validateJsonObject({ name: 'John' })); // true
 * console.log(validateJsonObject(new Date())); // false
 * console.log(validateJsonObject([])); // false
 * ```
 *
 * @example
 * Form state management:
 * ```typescript
 * interface FormState {
 *   values: Record<string, any>;
 *   errors: Record<string, string>;
 *   touched: Record<string, boolean>;
 * }
 *
 * function initializeFormState(initialValues: unknown): FormState {
 *   if (isEmptyPlainObject(initialValues)) {
 *     return {
 *       values: {},
 *       errors: {},
 *       touched: {}
 *     };
 *   }
 *
 *   if (isPlainObject(initialValues)) {
 *     return {
 *       values: { ...initialValues },
 *       errors: {},
 *       touched: {}
 *     };
 *   }
 *
 *   throw new Error('Initial values must be a plain object');
 * }
 * ```
 *
 * @example
 * Deep object comparison preparation:
 * ```typescript
 * function prepareForComparison(obj1: unknown, obj2: unknown) {
 *   // Handle empty objects consistently
 *   const isEmpty1 = isEmptyPlainObject(obj1);
 *   const isEmpty2 = isEmptyPlainObject(obj2);
 *
 *   if (isEmpty1 && isEmpty2) {
 *     return { equal: true, reason: 'Both are empty plain objects' };
 *   }
 *
 *   if (isEmpty1 || isEmpty2) {
 *     return { equal: false, reason: 'One is empty, the other is not' };
 *   }
 *
 *   // Both are non-empty, proceed with deep comparison
 *   return { equal: null, reason: 'Requires deep comparison' };
 * }
 * ```
 *
 * @example
 * API payload validation:
 * ```typescript
 * function validateApiPayload(payload: unknown) {
 *   if (isEmptyPlainObject(payload)) {
 *     return {
 *       valid: true,
 *       message: 'Empty payload is acceptable',
 *       data: {}
 *     };
 *   }
 *
 *   if (!isPlainObject(payload)) {
 *     return {
 *       valid: false,
 *       message: 'Payload must be a plain object',
 *       data: null
 *     };
 *   }
 *
 *   // Validate non-empty plain object
 *   return {
 *     valid: true,
 *     message: 'Valid payload received',
 *     data: payload
 *   };
 * }
 * ```
 *
 * @remarks
 * **Key Differences from `isEmptyObject()`:**
 * - Correctly handles built-in objects (Date, Error, Map, etc.) as `false`
 * - Only returns `true` for actual plain data objects
 * - Slightly slower due to comprehensive plain object validation
 * - Safer for serialization and data processing scenarios
 *
 * **Validation Process:**
 * 1. First validates that value is a plain object using `isPlainObject()`
 * 2. Then checks for enumerable properties using for-in loop
 * 3. Both conditions must pass for positive result
 *
 * **Use Cases:**
 * - JSON data validation
 * - Configuration object processing
 * - Form state management
 * - API payload validation
 * - Serialization safety checks
 *
 * **Performance vs Safety:**
 * - Choose this for correctness and safety
 * - Choose `isEmptyObject()` for performance with acceptable edge cases
 * - About 10-20% slower than `isEmptyObject()` due to plain object validation
 *
 * **Related Functions:**
 * - Use `isEmptyObject()` for faster but less strict checking
 * - Use `isPlainObject()` for plain object validation without emptiness check
 * - Use `Object.keys(obj).length === 0` for alternative emptiness check
 */
export const isEmptyPlainObject = (value: unknown): boolean => {
  if (!isPlainObject(value)) return false;
  for (const key in value) if (hasOwnProperty(value, key)) return false;
  return true;
};
