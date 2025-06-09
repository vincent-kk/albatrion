import { JSONPointer } from '../../enum';
import { escapeSegment } from './escapeSegment';

/**
 * Escapes a JSON Pointer path by escaping each segment.
 *
 * This function splits the path by the child separator (`/`), escapes each segment
 * individually, and then rejoins them. This ensures that special characters in
 * path segments are properly escaped for safe JSON Pointer usage.
 *
 * @example
 * ```typescript
 * escapePointer('/user/name.first')     // '/user/name~3first'
 * escapePointer('/items/\*\/value')       // '/items/~4/value'
 * escapePointer('/parent/../sibling')   // '/parent/~2/sibling'
 * ```
 *
 * @param path - The JSON Pointer path to escape. Should start with `/` for valid JSON Pointer.
 * @returns The escaped path with all special characters in segments properly escaped.
 *
 * @see {@link escapeSegment} for individual segment escaping logic
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6901} RFC 6901 - JSON Pointer specification
 */
export const escapePointer = (path: string): string => {
  const segments = path.split(JSONPointer.Child);
  for (let index = 0, length = segments.length; index < length; index++)
    segments[index] = escapeSegment(segments[index]);
  return segments.join(JSONPointer.Child);
};
