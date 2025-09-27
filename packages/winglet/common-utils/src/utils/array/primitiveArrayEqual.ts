/**
 * Compares two arrays for primitive value equality using strict equality (===).
 *
 * Performs a shallow comparison of two arrays by checking if they have the same length
 * and if all elements at corresponding indices are strictly equal. This function is
 * optimized for primitive values (strings, numbers, booleans, null, undefined) but
 * will also work with object references (comparing by reference, not deep equality).
 *
 * @param base - First array to compare
 * @param target - Second array to compare
 * @returns `true` if arrays have the same length and all elements are strictly equal, `false` otherwise
 *
 * @example
 * Primitive value comparison:
 * ```typescript
 * import { primitiveArrayEqual } from '@winglet/common-utils';
 *
 * const numbers1 = [1, 2, 3, 4, 5];
 * const numbers2 = [1, 2, 3, 4, 5];
 * const numbers3 = [1, 2, 3, 4, 6];
 *
 * console.log(primitiveArrayEqual(numbers1, numbers2)); // true
 * console.log(primitiveArrayEqual(numbers1, numbers3)); // false
 *
 * const strings1 = ['apple', 'banana', 'cherry'];
 * const strings2 = ['apple', 'banana', 'cherry'];
 * console.log(primitiveArrayEqual(strings1, strings2)); // true
 * ```
 *
 * @example
 * Different lengths and mixed types:
 * ```typescript
 * const array1 = [1, 'two', true, null, undefined];
 * const array2 = [1, 'two', true, null, undefined];
 * const array3 = [1, 'two', true, null]; // Different length
 * const array4 = [1, 'two', false, null, undefined]; // Different value
 *
 * console.log(primitiveArrayEqual(array1, array2)); // true
 * console.log(primitiveArrayEqual(array1, array3)); // false (different length)
 * console.log(primitiveArrayEqual(array1, array4)); // false (different value at index 2)
 *
 * // Object references are compared by reference, not deep equality
 * const obj = { id: 1 };
 * const refs1 = [obj, obj];
 * const refs2 = [obj, obj];
 * const refs3 = [{ id: 1 }, { id: 1 }]; // Different objects with same content
 * console.log(primitiveArrayEqual(refs1, refs2)); // true (same references)
 * console.log(primitiveArrayEqual(refs1, refs3)); // false (different references)
 * ```
 *
 * @remarks
 * **Performance:** Optimized with early return for length mismatch and efficient
 * loop iteration. Time complexity is O(n) where n is the array length.
 *
 * **Strict Equality:** Uses `!==` operator for comparison, which means:
 * - Type coercion does not occur (1 !== '1')
 * - NaN !== NaN (standard JavaScript behavior)
 * - Object references must be identical
 *
 * **Use Cases:** Ideal for comparing arrays of primitive values, checking if
 * array contents have changed, or validating array equality in unit tests.
 *
 * **Limitations:** Does not perform deep comparison of objects or nested arrays.
 * For deep equality, consider using a deep comparison utility.
 */
export const primitiveArrayEqual = (base: unknown[], target: unknown[]) => {
  if (base.length !== target.length) return false;
  for (let i = 0, e = base[0], l = base.length; i < l; i++, e = base[i])
    if (e !== target[i]) return false;
  return true;
};
