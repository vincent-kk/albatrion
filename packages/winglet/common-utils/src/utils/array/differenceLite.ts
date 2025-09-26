/**
 * Returns elements from the source array that are not present in the exclude array.
 *
 * Lightweight version of the `difference` function optimized for small arrays (< 100 elements).
 * Uses indexOf for exclusion checking instead of Set, providing better performance
 * for small arrays while maintaining O(n*m) complexity.
 *
 * @template Type - Type of array elements
 * @param source - Source array to filter elements from
 * @param exclude - Array containing elements to exclude from the result
 * @returns New array with elements from source array excluding those in exclude array
 *
 * @example
 * Basic difference operation:
 * ```typescript
 * import { differenceLite } from '@winglet/common-utils';
 *
 * const fruits = ['apple', 'banana', 'orange', 'grape'];
 * const toRemove = ['banana', 'grape'];
 *
 * console.log(differenceLite(fruits, toRemove));
 * // ['apple', 'orange']
 * ```
 *
 * @example
 * Number arrays:
 * ```typescript
 * const numbers = [1, 2, 3, 4, 5, 6];
 * const evens = [2, 4, 6];
 *
 * console.log(differenceLite(numbers, evens));
 * // [1, 3, 5]
 * ```
 *
 * @example
 * Working with duplicates:
 * ```typescript
 * const source = [1, 2, 2, 3, 4, 4, 5];
 * const exclude = [2, 4];
 *
 * console.log(differenceLite(source, exclude));
 * // [1, 3, 5] (all occurrences of excluded elements are removed)
 * ```
 *
 * @example
 * Edge cases:
 * ```typescript
 * // Empty source array
 * console.log(differenceLite([], [1, 2, 3])); // []
 *
 * // Empty exclude array
 * console.log(differenceLite([1, 2, 3], [])); // [1, 2, 3]
 *
 * // No common elements
 * console.log(differenceLite([1, 2, 3], [4, 5, 6])); // [1, 2, 3]
 *
 * // All elements excluded
 * console.log(differenceLite([1, 2, 3], [1, 2, 3, 4, 5])); // []
 * ```
 *
 * @example
 * String arrays with case sensitivity:
 * ```typescript
 * const words = ['Hello', 'World', 'hello', 'world'];
 * const exclude = ['Hello', 'World'];
 *
 * console.log(differenceLite(words, exclude));
 * // ['hello', 'world'] (case-sensitive comparison)
 * ```
 *
 * @remarks
 * **Performance Optimization:** This is a lightweight alternative to the standard `difference` function.
 * - For arrays with < 100 elements: Uses indexOf (O(n*m)) which is faster due to lower overhead
 * - For arrays with >= 100 elements: Consider using `difference` which uses Set (O(n+m))
 * - Optimized loop structure with cached element reference reduces array access overhead
 *
 * **When to Use:**
 * - Small arrays (typically < 100 elements)
 * - Performance-critical hot paths with small data sets
 * - When Set construction overhead outweighs O(n*m) complexity
 *
 * **Equality:** Uses JavaScript's strict equality (===) via indexOf.
 * This means NaN !== NaN (unlike Set.has() which uses SameValueZero).
 *
 * **Order Preservation:** Maintains the original order of elements from the source array
 * in the result array.
 *
 * **Memory Efficiency:** Uses direct array indexing and avoids Set construction overhead.
 * Result array grows dynamically without pre-allocation.
 */
export const differenceLite = <Type>(
  source: Type[],
  exclude: Type[],
): Type[] => {
  const result: Type[] = [];
  for (let i = 0, e = source[0], l = source.length; i < l; i++, e = source[i])
    if (exclude.indexOf(e) === -1) result[result.length] = e;
  return result;
};
