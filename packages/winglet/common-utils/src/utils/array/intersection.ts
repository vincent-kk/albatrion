/**
 * Returns elements from the source array that also exist in the target array.
 *
 * Creates a new array containing elements that are present in both the source and target arrays.
 * Uses Set-based lookup for efficient O(1) checking, making it suitable for large arrays.
 * Maintains the order of elements as they appear in the source array.
 *
 * @template Type - Type of array elements
 * @param source - Source array to use as base for intersection
 * @param target - Target array to compare against
 * @returns Array of elements that exist in both arrays
 *
 * @example
 * Basic intersection of number arrays:
 * ```typescript
 * import { intersection } from '@winglet/common-utils';
 *
 * const array1 = [1, 2, 3, 4, 5];
 * const array2 = [3, 4, 5, 6, 7];
 *
 * console.log(intersection(array1, array2)); // [3, 4, 5]
 * ```
 *
 * @example
 * String array intersection:
 * ```typescript
 * const fruits1 = ['apple', 'banana', 'orange', 'grape'];
 * const fruits2 = ['banana', 'grape', 'kiwi', 'mango'];
 *
 * console.log(intersection(fruits1, fruits2)); // ['banana', 'grape']
 * ```
 *
 * @example
 * Finding common user IDs:
 * ```typescript
 * const activeUserIds = [1, 2, 3, 4, 5, 6];
 * const premiumUserIds = [3, 4, 5, 7, 8, 9];
 *
 * const activePremiumUsers = intersection(activeUserIds, premiumUserIds);
 * console.log(activePremiumUsers); // [3, 4, 5]
 * ```
 *
 * @example
 * Working with duplicates:
 * ```typescript
 * const source = [1, 2, 2, 3, 4, 4, 5];
 * const target = [2, 4, 6];
 *
 * console.log(intersection(source, target)); // [2, 2, 4, 4]
 * // Note: Duplicates from source are preserved if they exist in target
 * ```
 *
 * @example
 * Case-sensitive string matching:
 * ```typescript
 * const words1 = ['Hello', 'World', 'hello', 'world'];
 * const words2 = ['Hello', 'world', 'Test'];
 *
 * console.log(intersection(words1, words2)); // ['Hello', 'world']
 * // Case-sensitive: 'hello' and 'World' don't match
 * ```
 *
 * @example
 * Finding common elements between datasets:
 * ```typescript
 * const currentUsers = ['alice', 'bob', 'charlie', 'diana'];
 * const invitedUsers = ['bob', 'charlie', 'eve', 'frank'];
 *
 * const alreadyRegistered = intersection(currentUsers, invitedUsers);
 * console.log(alreadyRegistered); // ['bob', 'charlie']
 * console.log(`${alreadyRegistered.length} invited users are already registered`);
 * ```
 *
 * @example
 * Edge cases:
 * ```typescript
 * // Empty arrays
 * console.log(intersection([], [1, 2, 3])); // []
 * console.log(intersection([1, 2, 3], [])); // []
 * console.log(intersection([], [])); // []
 *
 * // No common elements
 * console.log(intersection([1, 2, 3], [4, 5, 6])); // []
 *
 * // All elements in common
 * console.log(intersection([1, 2, 3], [1, 2, 3])); // [1, 2, 3]
 * ```
 *
 * @example
 * Working with mixed data types:
 * ```typescript
 * const mixed1 = [1, '2', 3, '4', 5];
 * const mixed2 = ['2', 3, '4', 6];
 *
 * console.log(intersection(mixed1, mixed2)); // ['2', 3, '4']
 * // Note: Uses strict equality (===) for comparison
 * ```
 *
 * @example
 * Permission intersection:
 * ```typescript
 * const userPermissions = ['read', 'write', 'delete', 'admin'];
 * const requiredPermissions = ['read', 'write', 'execute'];
 *
 * const grantedPermissions = intersection(userPermissions, requiredPermissions);
 * console.log(`User has ${grantedPermissions.length} of ${requiredPermissions.length} required permissions`);
 * console.log('Granted:', grantedPermissions); // ['read', 'write']
 * ```
 *
 * @remarks
 * **Performance:** Uses Set for O(1) average case lookup of target elements.
 * Total time complexity is O(n + m) where n is source length and m is target length.
 *
 * **Equality:** Uses JavaScript's SameValueZero equality algorithm (same as Set.has()).
 * This means NaN === NaN and +0 === -0 for intersection purposes.
 *
 * **Order Preservation:** Maintains the original order of elements from the source array
 * in the result array. Elements appear in the result in the same order they appear in source.
 *
 * **Duplicate Handling:** If the source array contains duplicates and those elements
 * exist in the target array, all occurrences from the source will be included in the result.
 *
 * **Memory Efficiency:** Uses direct array indexing and Set for optimal memory usage
 * and performance with large arrays.
 */
export const intersection = <Type>(source: Type[], target: Type[]): Type[] => {
  const result: Type[] = [];
  const targetSet = new Set(target);
  for (let i = 0, e = source[0], l = source.length; i < l; i++, e = source[i])
    if (targetSet.has(e)) result[result.length] = e;
  return result;
};
