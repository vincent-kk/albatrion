import { isObject } from './isObject';

/**
 * Determines whether a value is an empty object with enhanced type safety.
 *
 * Performs dual validation to ensure the value is both an object and has
 * no enumerable properties. Uses optimized iteration with early termination
 * for performance. Note: This function has known edge cases with built-in
 * objects for performance reasons.
 *
 * @param value - Value to test for empty object characteristics
 * @returns Type-safe boolean indicating whether the value is an empty object
 *
 * @example
 * Empty object detection:
 * ```typescript
 * import { isEmptyObject } from '@winglet/common-utils';
 *
 * // True cases - empty objects
 * console.log(isEmptyObject({})); // true
 * console.log(isEmptyObject([])); // true (empty array is empty object)
 * console.log(isEmptyObject(Object.create(null))); // true
 * console.log(isEmptyObject(new Object())); // true
 * 
 * // Performance edge cases (return true but are not truly empty)
 * console.log(isEmptyObject(new Date())); // true (performance optimization)
 * console.log(isEmptyObject(new Error())); // true (performance optimization)
 * console.log(isEmptyObject(new Map())); // true (performance optimization)
 * console.log(isEmptyObject(new Set())); // true (performance optimization)
 * console.log(isEmptyObject(new Promise(() => {}))); // true (performance optimization)
 * 
 * // False cases - not empty objects
 * console.log(isEmptyObject({ a: 1 })); // false (has properties)
 * console.log(isEmptyObject([1, 2, 3])); // false (has elements)
 * console.log(isEmptyObject('string')); // false (not an object)
 * console.log(isEmptyObject(42)); // false (not an object)
 * console.log(isEmptyObject(null)); // false (not an object)
 * console.log(isEmptyObject(undefined)); // false (not an object)
 * ```
 *
 * @example
 * Object processing with empty check:
 * ```typescript
 * function processObjectData(data: unknown) {
 *   if (isEmptyObject(data)) {
 *     console.log('Object is empty, using defaults');
 *     return { processed: true, hasData: false, defaults: true };
 *   }
 *   
 *   if (typeof data === 'object' && data !== null) {
 *     // Process non-empty object
 *     const keys = Object.keys(data);
 *     return {
 *       processed: true,
 *       hasData: true,
 *       keyCount: keys.length,
 *       keys
 *     };
 *   }
 *   
 *   throw new Error('Expected object data');
 * }
 * ```
 *
 * @example
 * Configuration merging:
 * ```typescript
 * function mergeConfig(defaultConfig: object, userConfig: unknown) {
 *   if (isEmptyObject(userConfig)) {
 *     console.log('No user config provided, using defaults');
 *     return { ...defaultConfig };
 *   }
 *   
 *   if (typeof userConfig === 'object' && userConfig !== null) {
 *     return { ...defaultConfig, ...userConfig };
 *   }
 *   
 *   console.warn('Invalid user config, using defaults');
 *   return { ...defaultConfig };
 * }
 * ```
 *
 * @example
 * Form validation:
 * ```typescript
 * interface FormErrors {
 *   [field: string]: string;
 * }
 *
 * function validateForm(formData: Record<string, any>): FormErrors {
 *   const errors: FormErrors = {};
 *   
 *   // Validation logic
 *   if (!formData.name) errors.name = 'Name is required';
 *   if (!formData.email) errors.email = 'Email is required';
 *   
 *   return errors;
 * }
 *
 * function handleFormSubmit(formData: Record<string, any>) {
 *   const errors = validateForm(formData);
 *   
 *   if (isEmptyObject(errors)) {
 *     console.log('Form is valid, submitting...');
 *     return submitForm(formData);
 *   }
 *   
 *   console.log('Form has errors:', errors);
 *   return { success: false, errors };
 * }
 * ```
 *
 * @example
 * Safe object operations:
 * ```typescript
 * function safeObjectOperation(obj: unknown, operation: 'keys' | 'values' | 'entries') {
 *   if (isEmptyObject(obj)) {
 *     // Return empty results for empty objects
 *     switch (operation) {
 *       case 'keys': return [];
 *       case 'values': return [];
 *       case 'entries': return [];
 *     }
 *   }
 *   
 *   if (typeof obj === 'object' && obj !== null) {
 *     switch (operation) {
 *       case 'keys': return Object.keys(obj);
 *       case 'values': return Object.values(obj);
 *       case 'entries': return Object.entries(obj);
 *     }
 *   }
 *   
 *   throw new Error('Expected object for operation');
 * }
 * ```
 *
 * @remarks
 * **Performance Optimization:**
 * - Uses early termination: returns `false` on first enumerable property found
 * - Skips comprehensive built-in object checks for performance
 * - Known edge cases with Date, Error, Map, Set, Promise objects
 *
 * **Edge Cases (Performance Trade-offs):**
 * - Built-in objects (Date, Error, Map, etc.) return `true` even though they have internal state
 * - This is intentional for performance reasons as noted in tests
 * - Use `isEmptyPlainObject()` for stricter validation if needed
 *
 * **Use Cases:**
 * - Configuration object validation
 * - Form error checking
 * - API response validation
 * - Default value assignment
 * - Object merging utilities
 *
 * **Related Functions:**
 * - Use `isEmptyPlainObject()` for stricter plain object checking
 * - Use `isEmptyArray()` for empty array detection
 * - Use `Object.keys(obj).length === 0` for comprehensive checking
 *
 * **Performance:** Optimized for common use cases with acceptable edge case trade-offs.
 */
export const isEmptyObject = (value: unknown): value is object => {
  if (!isObject(value)) return false;
  for (const _ in value) return false;
  return true;
};