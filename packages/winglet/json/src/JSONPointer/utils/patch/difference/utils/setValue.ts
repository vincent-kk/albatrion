import { JSONPointer } from '@/json/JSONPointer/enum';
import type { JsonObject } from '@/json/type';

/**
 * Sets a value in a JSON object using an optimized JSON Pointer path with automatic object creation.
 *
 * This function implements a high-performance JSON Pointer value assignment algorithm that
 * combines path traversal with intelligent object structure creation:
 *
 * - **Zero Array Allocations**: Parses paths character-by-character without `split()` or `slice()`
 * - **Lazy Object Creation**: Creates intermediate objects only when needed during traversal
 * - **Early Return Strategy**: Handles empty paths and root assignments efficiently
 * - **Optimized Character Access**: Caches character reads to minimize array access overhead
 * - **Direct Path Parsing**: Uses substring extraction only for the final key assignment
 *
 * The function automatically creates missing intermediate objects in the path, making it ideal
 * for building nested structures from JSON Pointer paths. It follows a modified RFC 6901 approach
 * optimized for merge patch operations.
 *
 * **Algorithm Complexity**: O(n) where n is the path length, with O(d) space complexity where d is path depth.
 *
 * @param source - The target JSON object to modify (modified in-place)
 * @param path - A JSON Pointer path string starting with "/" (e.g., "/user/name", "/items/0")
 * @param value - The value to set at the specified path
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6901 - JSON Pointer specification
 * @see https://datatracker.ietf.org/doc/html/rfc7386 - JSON Merge Patch specification
 *
 * @returns void - The function modifies the source object in-place
 */
export const setValue = (
  source: JsonObject,
  path: string,
  value: any,
): void => {
  if (path === '') return;

  let target = source;
  let segmentStart = 1;
  const pathLength = path.length;

  for (let index = 1; index <= pathLength; index++) {
    const char = path[index];
    if (index !== pathLength && char !== JSONPointer.Child) continue;
    if (index > segmentStart) {
      const segment = path.substring(segmentStart, index);
      if (index === pathLength) {
        target[segment] = value;
        return;
      }
      if (!(segment in target)) target[segment] = {};
      target = target[segment];
    }
    segmentStart = index + 1;
  }
};
