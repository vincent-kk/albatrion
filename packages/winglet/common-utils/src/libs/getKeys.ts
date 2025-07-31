import { hasOwnProperty } from './hasOwnProperty';

/**
 * Extracts keys from arrays, objects, and other values with enhanced type safety.
 *
 * Provides a unified interface for key extraction that handles arrays (returning
 * string indices), objects (returning property names), and other types with
 * fallback iteration. Optimized for performance with direct array handling.
 *
 * @template Value - Type of the input value
 * @param value - Value to extract keys from (array, object, or other)
 * @returns Array of string keys representing indices or property names
 *
 * @example
 * Array key extraction:
 * ```typescript
 * import { getKeys } from '@winglet/common-utils';
 *
 * const array = ['a', 'b', 'c'];
 * console.log(getKeys(array)); // ['0', '1', '2']
 *
 * const sparseArray = [1, , 3]; // sparse array
 * console.log(getKeys(sparseArray)); // ['0', '1', '2']
 * ```
 *
 * @example
 * Object key extraction:
 * ```typescript
 * const obj = { name: 'John', age: 30, city: 'NYC' };
 * console.log(getKeys(obj)); // ['name', 'age', 'city']
 *
 * const emptyObj = {};
 * console.log(getKeys(emptyObj)); // []
 * ```
 *
 * @example
 * Mixed type handling:
 * ```typescript
 * console.log(getKeys('hello')); // ['0', '1', '2', '3', '4']
 * console.log(getKeys(123)); // []
 * console.log(getKeys(null)); // []
 * console.log(getKeys(undefined)); // []
 * ```
 *
 * @remarks
 * **Behavior by Type:**
 * - **Arrays**: Returns string indices ('0', '1', '2', etc.)
 * - **Objects**: Returns own enumerable property names
 * - **Strings**: Returns character indices
 * - **Other**: Uses for...in loop with hasOwnProperty check
 *
 * **Performance:** Optimized array handling with pre-allocated string array.
 */
export const getKeys = <Value>(value: Value) => {
  // For arrays, return indices as strings
  if (Array.isArray(value)) {
    const keys = new Array<string>(value.length);
    for (let i = 0, l = keys.length; i < l; i++) keys[i] = '' + i;
    return keys;
  }
  if (value && typeof value === 'object') return Object.keys(value);
  const keys: string[] = [];
  for (const key in value)
    if (hasOwnProperty(value, key)) keys[keys.length] = key;
  return keys;
};
