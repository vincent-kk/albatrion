/**
 * Removes duplicate elements from an array using strict equality comparison.
 *
 * Creates a new array containing only unique elements from the source array.
 * Uses JavaScript's Set data structure for efficient duplicate detection with
 * SameValueZero equality algorithm. Maintains the order of first occurrence
 * of each unique element.
 *
 * @template Type - Type of array elements
 * @param source - Source array to remove duplicates from
 * @returns Array with duplicate elements removed
 *
 * @example
 * Basic duplicate removal:
 * ```typescript
 * import { unique } from '@winglet/common-utils';
 *
 * const numbers = [1, 2, 2, 3, 3, 3, 4, 5, 5];
 * console.log(unique(numbers)); // [1, 2, 3, 4, 5]
 *
 * const strings = ['apple', 'banana', 'apple', 'cherry', 'banana'];
 * console.log(unique(strings)); // ['apple', 'banana', 'cherry']
 * ```
 *
 * @example
 * Mixed data types:
 * ```typescript
 * const mixed = [1, '1', 2, '2', 1, 2, '1'];
 * console.log(unique(mixed)); // [1, '1', 2, '2']
 * // Note: 1 and '1' are different values (strict equality)
 * ```
 *
 * @example
 * Working with special values:
 * ```typescript
 * const specialValues = [0, -0, NaN, NaN, null, undefined, null, undefined];
 * console.log(unique(specialValues)); // [0, NaN, null, undefined]
 * // Note: NaN equals NaN in Set, +0 equals -0
 * ```
 *
 * @example
 * Boolean values:
 * ```typescript
 * const booleans = [true, false, true, true, false, false];
 * console.log(unique(booleans)); // [true, false]
 * ```
 *
 * @example
 * Remove duplicate IDs:
 * ```typescript
 * const userIds = [1, 5, 3, 5, 1, 8, 3, 9, 1];
 * const uniqueIds = unique(userIds);
 * console.log(uniqueIds); // [1, 5, 3, 8, 9]
 * console.log(`Found ${uniqueIds.length} unique users`);
 * ```
 *
 * @example
 * Unique tags or categories:
 * ```typescript
 * const tags = ['javascript', 'react', 'node', 'javascript', 'typescript', 'react'];
 * const uniqueTags = unique(tags);
 * console.log(uniqueTags); // ['javascript', 'react', 'node', 'typescript']
 * ```
 *
 * @example
 * Empty and single-element arrays:
 * ```typescript
 * console.log(unique([])); // []
 * console.log(unique([1])); // [1]
 * console.log(unique([5, 5, 5, 5])); // [5]
 * ```
 *
 * @example
 * Working with object references:
 * ```typescript
 * const obj1 = { id: 1 };
 * const obj2 = { id: 2 };
 * const obj3 = { id: 1 }; // Different object, same content
 *
 * const objects = [obj1, obj2, obj1, obj3, obj2];
 * console.log(unique(objects)); // [obj1, obj2, obj3]
 * // Note: obj1 and obj3 are different objects despite same content
 * ```
 *
 * @example
 * Remove duplicate characters:
 * ```typescript
 * const text = 'programming';
 * const chars = text.split('');
 * const uniqueChars = unique(chars);
 * console.log(uniqueChars.join('')); // 'progamin'
 * ```
 *
 * @example
 * Unique array elements:
 * ```typescript
 * const arr1 = [1, 2];
 * const arr2 = [3, 4];
 * const arr3 = [1, 2]; // Same content as arr1 but different reference
 *
 * const arrays = [arr1, arr2, arr1, arr3];
 * console.log(unique(arrays)); // [arr1, arr2, arr3]
 * // Arrays are compared by reference, not content
 * ```
 *
 * @example
 * Combining with other operations:
 * ```typescript
 * const data = [1, 2, 3, 2, 4, 3, 5, 1];
 * 
 * // Get unique values and sort them
 * const uniqueSorted = unique(data).sort((a, b) => a - b);
 * console.log(uniqueSorted); // [1, 2, 3, 4, 5]
 *
 * // Get count of unique values
 * const uniqueCount = unique(data).length;
 * console.log(`${uniqueCount} unique values out of ${data.length} total`);
 * ```
 *
 * @example
 * Performance comparison scenario:
 * ```typescript
 * // For large arrays, unique() is much more efficient than manual filtering
 * const largeArray = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 1000));
 * 
 * // Efficient approach using Set
 * const uniqueValues = unique(largeArray);
 * 
 * // Less efficient manual approach (for comparison)
 * const manualUnique = largeArray.filter((item, index) => largeArray.indexOf(item) === index);
 * ```
 *
 * @remarks
 * **Performance:** Uses JavaScript's native Set constructor for O(n) time complexity
 * and optimal performance. Set automatically handles duplicate detection efficiently.
 *
 * **Equality Algorithm:** Uses SameValueZero equality (same as Set.has()):
 * - NaN is equal to NaN
 * - +0 is equal to -0
 * - All other values use strict equality (===)
 *
 * **Order Preservation:** Maintains the order of elements as they first appear
 * in the source array. Later duplicates are ignored.
 *
 * **Memory Efficiency:** Creates a Set for deduplication, then converts back to array.
 * Memory usage is proportional to the number of unique elements.
 *
 * **Reference vs Value:** For objects and arrays, comparison is done by reference,
 * not by content. Use `uniqueBy` or `uniqueWith` for content-based deduplication.
 */
export const unique = <Type>(source: Type[]): Type[] =>
  Array.from(new Set(source));
