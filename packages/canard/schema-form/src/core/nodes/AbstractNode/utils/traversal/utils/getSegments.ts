import { isTruthy } from '@winglet/common-utils/filter';

import { JSONPointer } from '@/schema-form/helpers/jsonPointer';

/**
 * Parses a JSON Pointer path string into an array of segments.
 *
 * This function takes a path string (e.g., '/foo/bar~1baz'), splits it by the
 * child separator ('/'), filters out any empty segments that result from
 * leading/trailing or consecutive separators.
 *
 * @example
 * ```typescript
 * // Standard path
 * getSegments('/foo/bar')            // ['foo', 'bar']
 *
 * // Path with escaped characters, it will be returned as is
 * getSegments('/a~1b/c~0d')          // ['a~1b', 'c~0d']
 *
 * // Handles leading/trailing/consecutive slashes
 * getSegments('foo/bar/')            // ['foo', 'bar']
 * getSegments('/foo//bar')           // ['foo', 'bar']
 *
 * // Empty or root path
 * getSegments('')                    // []
 * getSegments('/')                   // []
 * ```
 *
 * @param pointer - The JSON Pointer path string to parse.
 * @returns An array of path segments.(no unescape)
 */
export const getSegments = (pointer: string) =>
  pointer.split(JSONPointer.Separator).filter(isTruthy);
