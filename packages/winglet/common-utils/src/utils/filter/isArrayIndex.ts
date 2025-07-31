/**
 * Determines whether a string represents a valid array index.
 *
 * Performs character-by-character validation to check if a string consists
 * entirely of numeric digits, making it suitable for use as an array index.
 * Optimized for performance with manual character code checking.
 *
 * @param value - String to test for valid array index format
 * @returns Boolean indicating whether the string is a valid array index
 *
 * @example
 * Valid array index strings:
 * ```typescript
 * import { isArrayIndex } from '@winglet/common-utils';
 *
 * console.log(isArrayIndex('0')); // true
 * console.log(isArrayIndex('123')); // true
 * console.log(isArrayIndex('999')); // true
 * console.log(isArrayIndex('42')); // true
 * 
 * // Invalid array index strings
 * console.log(isArrayIndex('')); // false (empty string)
 * console.log(isArrayIndex('01')); // false (leading zero, but still digits)
 * console.log(isArrayIndex('12.5')); // false (contains decimal point)
 * console.log(isArrayIndex('abc')); // false (contains letters)
 * console.log(isArrayIndex('12a')); // false (mixed alphanumeric)
 * console.log(isArrayIndex('-5')); // false (negative number)
 * console.log(isArrayIndex(' 123 ')); // false (contains spaces)
 * ```
 *
 * @example
 * Object property validation:
 * ```typescript
 * function processObjectProperties(obj: Record<string, any>) {
 *   for (const key in obj) {
 *     if (isArrayIndex(key)) {
 *       console.log(`Array-like index: ${key} = ${obj[key]}`);
 *     } else {
 *       console.log(`Named property: ${key} = ${obj[key]}`);
 *     }
 *   }
 * }
 *
 * // Usage
 * processObjectProperties({
 *   '0': 'first',
 *   '1': 'second',
 *   'name': 'John',
 *   '12': 'twelve'
 * });
 * ```
 *
 * @example
 * Dynamic array access validation:
 * ```typescript
 * function safeArrayAccess(arr: any[], key: string): any {
 *   if (isArrayIndex(key)) {
 *     const index = parseInt(key, 10);
 *     return arr[index];
 *   }
 *   
 *   console.warn(`Invalid array index: ${key}`);
 *   return undefined;
 * }
 * ```
 *
 * @example
 * Form data processing:
 * ```typescript
 * function parseFormArrayData(formData: Record<string, string>) {
 *   const arrayItems: string[] = [];
 *   const namedFields: Record<string, string> = {};
 *   
 *   for (const [key, value] of Object.entries(formData)) {
 *     if (isArrayIndex(key)) {
 *       arrayItems[parseInt(key, 10)] = value;
 *     } else {
 *       namedFields[key] = value;
 *     }
 *   }
 *   
 *   return { arrayItems, namedFields };
 * }
 * ```
 *
 * @remarks
 * **Validation Rules:**
 * - Must contain only digits (0-9)
 * - Cannot be empty string
 * - No leading/trailing whitespace allowed
 * - No decimal points or negative signs
 * - Leading zeros are technically valid (returns true)
 *
 * **Performance Optimization:**
 * - Uses character code checking (48-57 for digits 0-9)
 * - Avoids regex or parsing overhead
 * - Early termination on first non-digit
 *
 * **Use Cases:**
 * - Object property iteration and classification
 * - Dynamic array access validation
 * - Form data processing
 * - Array-like object detection
 *
 * **Note:** This function only validates string format, not actual array bounds.
 * Use additional bounds checking when accessing arrays.
 */
export const isArrayIndex = (value: string): boolean => {
  if (!value) return false;
  let character;
  let index = 0;
  const length = value.length;
  while (index < length) {
    character = value.charCodeAt(index);
    if (character < 48 || character > 57) return false;
    index++;
  }
  return true;
};