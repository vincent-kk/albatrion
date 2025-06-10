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
 * escapePath('/user/name.first')     // '/user/name~3first'
 * escapePath('/items/\*\/value')       // '/items/~4/value'
 * escapePath('/parent/../sibling')   // '/parent/~2/sibling'
 * ```
 *
 * @param path - The JSON Pointer path to escape. Should start with `/` for valid JSON Pointer.
 * @returns The escaped path with all special characters in segments properly escaped.
 *
 * @see {@link escapeSegment} for individual segment escaping logic
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6901} RFC 6901 - JSON Pointer specification
 */
export const escapePath = (path: string): string => {
  const segments = path.split(JSONPointer.Child);
  const length = segments.length;
  if (length === 0) return '';
  if (length === 1) return escapeSegment(segments[0]);
  let result = escapeSegment(segments[0]);
  for (let index = 1; index < length; index++)
    result += JSONPointer.Child + escapeSegment(segments[index]);
  return result;
};
