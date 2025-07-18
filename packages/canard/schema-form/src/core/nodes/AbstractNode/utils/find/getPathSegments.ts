import { isTruthy } from '@winglet/common-utils/filter';
import { unescapeSegment } from '@winglet/json/pointer';

import { JSONPointer } from '@/schema-form/helpers/jsonPointer';

/**
 * Parses a JSON Pointer path string into an array of unescaped segments.
 *
 * This function takes a path string (e.g., '/foo/bar~1baz'), splits it by the
 * child separator ('/'), filters out any empty segments that result from
 * leading/trailing or consecutive separators, and then unescapes each segment
 * according to RFC 6901 and custom rules.
 *
 * @example
 * ```typescript
 * // Standard path
 * getPathSegments('/foo/bar')            // ['foo', 'bar']
 *
 * // Path with escaped characters
 * getPathSegments('/a~1b/c~0d')          // ['a/b', 'c~d']
 *
 * // Handles leading/trailing/consecutive slashes
 * getPathSegments('foo/bar/')            // ['foo', 'bar']
 * getPathSegments('/foo//bar')           // ['foo', 'bar']
 *
 * // Empty or root path
 * getPathSegments('')                    // null
 * getPathSegments('/')                   // null
 * ```
 *
 * @param path - The JSON Pointer path string to parse.
 * @returns An array of unescaped path segments.
 */
export const getPathSegments = (path: string) => {
  const segments = path.split(JSONPointer.Separator).filter(isTruthy);
  if (segments.length === 0) return null;
  for (let index = 0, length = segments.length; index < length; index++)
    segments[index] = unescapeSegment(segments[index]);
  return segments;
};
