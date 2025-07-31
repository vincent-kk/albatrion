/**
 * Retrieves element(s) at given index(es) from an array with support for negative indexing.
 *
 * Provides a flexible way to access array elements using positive or negative indices.
 * Negative indices count from the end of the array (-1 for last element).
 * Supports both single index retrieval and multiple index retrieval in a single call.
 *
 * @template Type - Type of array elements
 * @template Indexes - Index or array of indices to retrieve
 * @template Result - Return result type (Type for single index, Type[] for array indices)
 * @param array - Target array to retrieve elements from
 * @param indexes - Index or array of indices of elements to retrieve
 * @returns Array element(s) at the given index(es)
 *
 * @example
 * Single index access:
 * ```typescript
 * import { at } from '@winglet/common-utils';
 *
 * const numbers = [10, 20, 30, 40, 50];
 * console.log(at(numbers, 0));  // 10 (first element)
 * console.log(at(numbers, 2));  // 30 (third element)
 * console.log(at(numbers, -1)); // 50 (last element)
 * console.log(at(numbers, -2)); // 40 (second to last)
 * ```
 *
 * @example
 * Multiple index access:
 * ```typescript
 * const letters = ['a', 'b', 'c', 'd', 'e'];
 * console.log(at(letters, [0, 2, 4]));     // ['a', 'c', 'e']
 * console.log(at(letters, [-1, -3, -5])); // ['e', 'c', 'a']
 * console.log(at(letters, [1, -1, 0]));   // ['b', 'e', 'a']
 * ```
 *
 * @example
 * Object array access:
 * ```typescript
 * const users = [
 *   { id: 1, name: 'Alice' },
 *   { id: 2, name: 'Bob' },
 *   { id: 3, name: 'Charlie' }
 * ];
 *
 * console.log(at(users, 1));      // { id: 2, name: 'Bob' }
 * console.log(at(users, [0, -1])); // [{ id: 1, name: 'Alice' }, { id: 3, name: 'Charlie' }]
 * ```
 *
 * @example
 * Handling edge cases:
 * ```typescript
 * const array = [1, 2, 3];
 *
 * // Out of bounds indices return undefined
 * console.log(at(array, 5));    // undefined
 * console.log(at(array, [-5])); // [undefined]
 *
 * // Non-integer indices are truncated
 * console.log(at(array, [1.7, 2.3])); // [2, 3]
 *
 * // Empty array handling
 * console.log(at([], 0)); // undefined
 * ```
 *
 * @remarks
 * **Type Safety:** Return type is automatically inferred based on input type.
 * Single index returns `Type`, array of indices returns `Type[]`.
 *
 * **Index Normalization:** Non-integer indices are truncated using `Math.trunc()`,
 * with NaN values converted to 0. This ensures predictable behavior with floating-point inputs.
 *
 * **Negative Indexing:** Negative indices are converted to positive indices
 * by adding the array length. Out-of-bounds negative indices return undefined.
 *
 * **Performance:** Uses direct array access with pre-allocated result arrays
 * for optimal performance with large index collections.
 */
export const at = <
  Type,
  Indexes extends number[] | number,
  Result = Indexes extends number[] ? Type[] : Type,
>(
  array: readonly Type[],
  indexes: Indexes,
): Result => {
  if (typeof indexes === 'number') {
    const index = indexes < 0 ? indexes + array.length : indexes;
    return array[index] as unknown as Result;
  }
  const length = array.length;
  const indexesLength = indexes.length;
  const result = new Array<Type>(indexesLength);
  for (let i = 0; i < indexesLength; i++) {
    let index = indexes[i];
    index = Math.trunc(index) || 0;
    if (index < 0) index += length;
    result[i] = array[index];
  }
  return result as Result;
};
