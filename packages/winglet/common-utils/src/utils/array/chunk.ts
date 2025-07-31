import { isInteger } from '@/common-utils/utils/filter/isInteger';

/**
 * Splits an array into smaller chunks of specified maximum size.
 *
 * Divides a large array into manageable chunks, useful for pagination,
 * batch processing, API rate limiting, and memory management. Handles
 * edge cases gracefully and ensures all elements are included.
 *
 * @template Type - Type of array elements
 * @param array - Source array to split into chunks
 * @param size - Maximum number of elements per chunk (must be positive integer)
 * @returns Array of subarrays, each containing up to `size` elements
 *
 * @example
 * Basic chunking:
 * ```typescript
 * import { chunk } from '@winglet/common-utils';
 *
 * const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
 * console.log(chunk(numbers, 3)); // [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
 * console.log(chunk(numbers, 4)); // [[1, 2, 3, 4], [5, 6, 7, 8], [9]]
 * console.log(chunk(numbers, 10)); // [[1, 2, 3, 4, 5, 6, 7, 8, 9]]
 * ```
 *
 * @example
 * Batch API requests:
 * ```typescript
 * const userIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
 * const batches = chunk(userIds, 5); // Process 5 users at a time
 *
 * for (const batch of batches) {
 *   const users = await Promise.all(
 *     batch.map(id => fetchUser(id))
 *   );
 *   console.log(`Processed ${users.length} users`);
 * }
 * ```
 *
 * @example
 * Pagination implementation:
 * ```typescript
 * const items = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);
 * const pageSize = 10;
 * const pages = chunk(items, pageSize);
 *
 * console.log(`Total pages: ${pages.length}`);
 * console.log(`Page 1:`, pages[0]); // First 10 items
 * console.log(`Last page:`, pages[pages.length - 1]); // Remaining items
 * ```
 *
 * @example
 * Various data types:
 * ```typescript
 * // String array
 * const words = ['a', 'b', 'c', 'd', 'e'];
 * console.log(chunk(words, 2)); // [['a', 'b'], ['c', 'd'], ['e']]
 *
 * // Object array
 * const users = [
 *   { id: 1, name: 'Alice' },
 *   { id: 2, name: 'Bob' },
 *   { id: 3, name: 'Charlie' }
 * ];
 * console.log(chunk(users, 2));
 * // [[{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}], [{id: 3, name: 'Charlie'}]]
 * ```
 *
 * @remarks
 * **Error Handling:** Returns the original array wrapped in an array if
 * size is not a positive integer. This prevents runtime errors while
 * maintaining predictable return type.
 *
 * **Performance:** Uses simple iteration with slice for optimal performance
 * and memory efficiency with large arrays.
 *
 * **Last Chunk:** When array length is not evenly divisible by chunk size,
 * the last chunk contains only the remaining elements.
 */
export const chunk = <Type>(array: Type[], size: number): Type[][] => {
  if (!isInteger(size) || size < 1) return [array];
  const chunkCount = Math.ceil(array.length / size);
  const result: Type[][] = new Array(chunkCount);
  for (let index = 0; index < chunkCount; index++) {
    const start = index * size;
    const end = start + size;
    result[index] = array.slice(start, end);
  }
  return result;
};
