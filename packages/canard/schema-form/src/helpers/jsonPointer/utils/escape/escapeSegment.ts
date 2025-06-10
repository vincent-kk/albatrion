import { JSONPointer } from '../../enum';
import {
  ESCAPE_CHILD,
  ESCAPE_CURRENT,
  ESCAPE_INDEX,
  ESCAPE_PARENT,
  ESCAPE_ROOT,
  ESCAPE_TILDE,
  TILDE,
} from './constant';

/**
 * Escapes special characters in a JSON Pointer segment.
 *
 * This function converts special characters to their escaped equivalents according
 * to both RFC 6901 standard and custom extensions. It performs an optimization
 * check first - if the segment contains no special characters, it returns the
 * original segment immediately.
 *
 * **Escape Mappings:**
 * - `~` → `~0` (RFC 6901 standard)
 * - `/` → `~1` (RFC 6901 standard)
 * - `..` → `~2` (Custom: parent directory)
 * - `.` → `~3` (Custom: current directory)
 * - `*` → `~4` (Custom: wildcard/all indices)
 * - `#` → `~5` (Custom: root fragment identifier)
 *
 * @example
 * ```typescript
 * escapeSegment('name.first')    // 'name~3first'
 * escapeSegment('path/to')       // 'path~1to'
 * escapeSegment('parent/..')     // 'parent~1~2'
 * escapeSegment('items/*')       // 'items~1~4'
 * escapeSegment('~already')      // '~0already'
 * escapeSegment('safe_name')     // 'safe_name' (no escaping needed)
 * ```
 *
 * @param segment - The path segment to escape. Should not contain `/` as path separator.
 * @returns The escaped segment with special characters replaced by escape sequences.
 *
 * @see {@link unescapeSegment} for the reverse operation
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6901#section-3} RFC 6901 - Escaping rules
 */
export const escapeSegment = (segment: string): string => {
  if (isSafeSegment(segment)) return segment;
  const length = segment.length;
  let result = '';
  for (let index = 0; index < length; index++) {
    const character = segment[index];
    if (
      character === JSONPointer.Current &&
      segment[index + 1] === JSONPointer.Current
    ) {
      result += ESCAPE_PARENT;
      index++;
    } else if (character === TILDE) result += ESCAPE_TILDE;
    else if (character === JSONPointer.Child) result += ESCAPE_CHILD;
    else if (character === JSONPointer.Current) result += ESCAPE_CURRENT;
    else if (character === JSONPointer.Index) result += ESCAPE_INDEX;
    else if (character === JSONPointer.Root) result += ESCAPE_ROOT;
    else result += character;
  }
  return result;
};

/**
 * Checks if a segment is safe to use without escaping.
 *
 * This function performs a fast check to determine if a segment contains any
 * special characters that require escaping. It's used as an optimization to
 * avoid unnecessary string processing when no escaping is needed.
 *
 * **Special characters checked:**
 * - `~` (tilde - escape prefix)
 * - `/` (slash - path separator)
 * - `.` (dot - current/parent directory markers)
 * - `*` (asterisk - wildcard operator)
 * - `#` (hash - root fragment identifier)
 *
 * @param segment - The segment to check for special characters.
 * @returns `true` if the segment contains no special characters, `false` otherwise.
 *
 * @internal This function is used internally for performance optimization.
 */
const isSafeSegment = (segment: string): boolean => {
  const length = segment.length;
  for (let index = 0; index < length; index++) {
    const character = segment[index];
    if (
      character === TILDE ||
      character === JSONPointer.Child ||
      character === JSONPointer.Current ||
      character === JSONPointer.Index ||
      character === JSONPointer.Root
    )
      return false;
  }
  return true;
};
