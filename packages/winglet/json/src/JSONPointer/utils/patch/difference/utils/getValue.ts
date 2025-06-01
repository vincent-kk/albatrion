import { JSONPointer } from '@/json/JSONPointer/enum';
import type { JsonObject } from '@/json/type';

/**
 * Retrieves a value from a JSON object using an optimized JSON Pointer path.
 *
 * This function implements a high-performance JSON Pointer value retrieval algorithm that
 * avoids common performance pitfalls found in traditional implementations:
 *
 * - **Zero Array Allocations**: Parses paths character-by-character without `split()` or `slice()`
 * - **Early Termination**: Returns `undefined` immediately when encountering null/undefined values
 * - **Optimized Character Access**: Caches character reads to minimize array access overhead
 * - **Direct Path Parsing**: Uses substring extraction only when needed for segment identification
 *
 * The function follows RFC 6901 JSON Pointer specification for path traversal while maintaining
 * maximum performance through careful algorithm design.
 *
 * **Algorithm Complexity**: O(n) where n is the path length, with O(1) space complexity.
 *
 * @param source - The source JSON object to traverse
 * @param path - A JSON Pointer path string starting with "/" (e.g., "/user/name", "/items/0")
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6901 - JSON Pointer specification
 * @see https://datatracker.ietf.org/doc/html/rfc7159 - JSON specification
 *
 * @returns The value at the specified path, or `undefined` if the path doesn't exist or
 *          encounters null/undefined values during traversal.
 */
export const getValue = (source: JsonObject, path: string): any => {
  if (path === '') return source;

  let target = source;
  let segmentStart = 1;
  const pathLength = path.length;

  for (let index = 1; index <= pathLength; index++) {
    const char = path[index];
    if (index !== pathLength && char !== JSONPointer.Child) continue;
    if (index > segmentStart) {
      if (target == null) return undefined;
      const segment = path.substring(segmentStart, index);
      target = target[segment];
    }
    segmentStart = index + 1;
  }

  return target;
};
