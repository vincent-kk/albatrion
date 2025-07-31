/**
 * Returns elements from the source array that are not present in the exclude array.
 *
 * Creates a new array containing only the elements from the source array that do not exist
 * in the exclude array. Uses Set-based lookup for efficient O(1) exclusion checking,
 * making it suitable for large arrays.
 *
 * @template Type - Type of array elements
 * @param source - Source array to filter elements from
 * @param exclude - Array containing elements to exclude from the result
 * @returns New array with elements from source array excluding those in exclude array
 *
 * @example
 * Basic difference operation:
 * ```typescript
 * import { difference } from '@winglet/common-utils';
 *
 * const fruits = ['apple', 'banana', 'orange', 'grape'];
 * const toRemove = ['banana', 'grape'];
 * 
 * console.log(difference(fruits, toRemove)); 
 * // ['apple', 'orange']
 * ```
 *
 * @example
 * Number arrays:
 * ```typescript
 * const numbers = [1, 2, 3, 4, 5, 6];
 * const evens = [2, 4, 6];
 * 
 * console.log(difference(numbers, evens)); 
 * // [1, 3, 5]
 * ```
 *
 * @example
 * Working with duplicates:
 * ```typescript
 * const source = [1, 2, 2, 3, 4, 4, 5];
 * const exclude = [2, 4];
 * 
 * console.log(difference(source, exclude)); 
 * // [1, 3, 5] (duplicates in source are preserved, but excluded elements are removed)
 * ```
 *
 * @example
 * Edge cases:
 * ```typescript
 * // Empty source array
 * console.log(difference([], [1, 2, 3])); // []
 * 
 * // Empty exclude array
 * console.log(difference([1, 2, 3], [])); // [1, 2, 3]
 * 
 * // No common elements
 * console.log(difference([1, 2, 3], [4, 5, 6])); // [1, 2, 3]
 * 
 * // All elements excluded
 * console.log(difference([1, 2, 3], [1, 2, 3, 4, 5])); // []
 * ```
 *
 * @example
 * String arrays with case sensitivity:
 * ```typescript
 * const words = ['Hello', 'World', 'hello', 'world'];
 * const exclude = ['Hello', 'World'];
 * 
 * console.log(difference(words, exclude)); 
 * // ['hello', 'world'] (case-sensitive comparison)
 * ```
 *
 * @remarks
 * **Performance:** Uses Set for O(1) average case lookup of excluded elements.
 * Total time complexity is O(n + m) where n is source length and m is exclude length.
 *
 * **Equality:** Uses JavaScript's SameValueZero equality algorithm (same as Set.has()).
 * This means NaN === NaN and +0 === -0 for exclusion purposes.
 *
 * **Order Preservation:** Maintains the original order of elements from the source array
 * in the result array.
 *
 * **Memory Efficiency:** Pre-allocates result array and uses direct indexing
 * to minimize memory allocations and improve performance.
 */
export const difference = <Type>(source: Type[], exclude: Type[]): Type[] => {
  const result: Type[] = [];
  const excludeSet = new Set(exclude);
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    if (!excludeSet.has(item)) result[result.length] = item;
  }
  return result;
};
