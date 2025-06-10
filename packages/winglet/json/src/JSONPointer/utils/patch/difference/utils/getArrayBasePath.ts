import { isArrayIndex } from '@winglet/common-utils/filter';

import { JSONPointer } from '@/json/JSONPointer/enum';

/**
 * Extracts the base path of an array from a JSON Pointer path that targets an array element.
 *
 * This function analyzes JSON Pointer paths to determine if they target array elements and returns
 * the path to the containing array. It implements an optimized single-pass algorithm that:
 *
 * - Parses JSON Pointer paths character by character to avoid array allocations
 * - Uses `isArrayIndex()` to validate numeric array indices according to JSON standards
 * - Handles nested structures with arrays at different depths
 * - Returns the immediate parent array path when an array index is detected
 *
 * The function is critical for the array optimization strategy in `differenceObjectPatch()`,
 * allowing the system to replace entire arrays instead of applying individual element patches
 * when arrays contain changes.
 *
 * **Algorithm Complexity**: O(n) where n is the path length, with O(1) space usage.
 *
 * @param path - A JSON Pointer path string (e.g., "/users/0/name", "/data/items/1")
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6901 - JSON Pointer specification
 * @see https://tools.ietf.org/html/rfc7159#section-6 - JSON array specification
 *
 * @returns The base path to the containing array, or `null` if the path doesn't target an array element.
 *          - For array paths: returns the path to the array container
 *          - For non-array paths: returns `null`
 *          - For root array elements: returns empty string `""`
 */
export const getArrayBasePath = (path: string): string | null => {
  let lastSlash = -1;
  let segmentStart = 1;
  for (let i = 1; i < path.length; i++) {
    if (path[i] === JSONPointer.Separator) {
      const segment = path.slice(segmentStart, i);
      if (isArrayIndex(segment))
        return lastSlash !== -1 ? path.slice(0, lastSlash) : '';
      lastSlash = i;
      segmentStart = i + 1;
    }
  }
  const lastSegment = path.slice(segmentStart);
  if (isArrayIndex(lastSegment))
    return lastSlash !== -1 ? path.slice(0, lastSlash) : '';
  return null;
};
