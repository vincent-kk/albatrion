/**
 * Returns elements from the source array that also exist in the target array.
 *
 * Lightweight version of the `intersection` function optimized for small arrays (< 100 elements).
 * Uses indexOf for element checking instead of Set, providing better performance
 * for small arrays while maintaining O(n*m) complexity.
 *
 * @template Type - Type of array elements
 * @param source - Source array to use as base for intersection
 * @param target - Target array to compare against
 * @returns Array of elements that exist in both arrays
 *
 * @example
 * Basic intersection of number arrays:
 * ```typescript
 * import { intersectionLite } from '@winglet/common-utils';
 *
 * const array1 = [1, 2, 3, 4, 5];
 * const array2 = [3, 4, 5, 6, 7];
 *
 * console.log(intersectionLite(array1, array2)); // [3, 4, 5]
 * ```
 *
 * @example
 * String array intersection:
 * ```typescript
 * const fruits1 = ['apple', 'banana', 'orange', 'grape'];
 * const fruits2 = ['banana', 'grape', 'kiwi', 'mango'];
 *
 * console.log(intersectionLite(fruits1, fruits2)); // ['banana', 'grape']
 * ```
 *
 * @example
 * Finding common user IDs:
 * ```typescript
 * const activeUserIds = [1, 2, 3, 4, 5, 6];
 * const premiumUserIds = [3, 4, 5, 7, 8, 9];
 *
 * const activePremiumUsers = intersectionLite(activeUserIds, premiumUserIds);
 * console.log(activePremiumUsers); // [3, 4, 5]
 * ```
 *
 * @example
 * Working with duplicates:
 * ```typescript
 * const source = [1, 2, 2, 3, 4, 4, 5];
 * const target = [2, 4, 6];
 *
 * console.log(intersectionLite(source, target)); // [2, 2, 4, 4]
 * // Note: Duplicates from source are preserved if they exist in target
 * ```
 *
 * @example
 * Case-sensitive string matching:
 * ```typescript
 * const words1 = ['Hello', 'World', 'hello', 'world'];
 * const words2 = ['Hello', 'world', 'Test'];
 *
 * console.log(intersectionLite(words1, words2)); // ['Hello', 'world']
 * // Case-sensitive: 'hello' and 'World' don't match
 * ```
 *
 * @example
 * Finding common elements between datasets:
 * ```typescript
 * const currentUsers = ['alice', 'bob', 'charlie', 'diana'];
 * const invitedUsers = ['bob', 'charlie', 'eve', 'frank'];
 *
 * const alreadyRegistered = intersectionLite(currentUsers, invitedUsers);
 * console.log(alreadyRegistered); // ['bob', 'charlie']
 * console.log(`${alreadyRegistered.length} invited users are already registered`);
 * ```
 *
 * @example
 * Edge cases:
 * ```typescript
 * // Empty arrays
 * console.log(intersectionLite([], [1, 2, 3])); // []
 * console.log(intersectionLite([1, 2, 3], [])); // []
 * console.log(intersectionLite([], [])); // []
 *
 * // No common elements
 * console.log(intersectionLite([1, 2, 3], [4, 5, 6])); // []
 *
 * // All elements in common
 * console.log(intersectionLite([1, 2, 3], [1, 2, 3])); // [1, 2, 3]
 * ```
 *
 * @example
 * Working with mixed data types:
 * ```typescript
 * const mixed1 = [1, '2', 3, '4', 5];
 * const mixed2 = ['2', 3, '4', 6];
 *
 * console.log(intersectionLite(mixed1, mixed2)); // ['2', 3, '4']
 * // Note: Uses strict equality (===) for comparison
 * ```
 *
 * @example
 * Permission intersection:
 * ```typescript
 * const userPermissions = ['read', 'write', 'delete', 'admin'];
 * const requiredPermissions = ['read', 'write', 'execute'];
 *
 * const grantedPermissions = intersectionLite(userPermissions, requiredPermissions);
 * console.log(`User has ${grantedPermissions.length} of ${requiredPermissions.length} required permissions`);
 * console.log('Granted:', grantedPermissions); // ['read', 'write']
 * ```
 *
 * @remarks
 * **Performance Optimization:** This is a lightweight alternative to the standard `intersection` function.
 * - For arrays with < 100 elements: Uses indexOf (O(n*m)) which is faster due to lower overhead
 * - For arrays with >= 100 elements: Consider using `intersection` which uses Set (O(n+m))
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
 * in the result array. Elements appear in the result in the same order they appear in source.
 *
 * **Duplicate Handling:** If the source array contains duplicates and those elements
 * exist in the target array, all occurrences from the source will be included in the result.
 *
 * **Memory Efficiency:** Uses direct array indexing and avoids Set construction overhead.
 * Result array grows dynamically without pre-allocation.
 */
export const intersectionLite = <Type>(
  source: Type[],
  target: Type[],
): Type[] => {
  const result: Type[] = [];
  for (let i = 0, e = source[0], l = source.length; i < l; i++, e = source[i])
    if (target.indexOf(e) !== -1) result[result.length] = e;
  return result;
};
