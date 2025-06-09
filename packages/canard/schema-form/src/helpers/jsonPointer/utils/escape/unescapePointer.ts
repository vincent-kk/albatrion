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
 * Regular expression pattern to match escape sequences.
 * Matches `~` followed by digits 0-5, which correspond to our escape mappings.
 */
const ESCAPE_PATTERN = /~[0-5]/g;

/**
 * Unescapes a JSON Pointer segment or path by converting escape sequences back to original characters.
 *
 * This function reverses the escaping process, converting escape sequences back to
 * their original special characters. It performs an optimization check first - if
 * the input contains no tilde characters, it returns the original string immediately.
 *
 * **Note**: While named `unescapeSegment`, this function can be used for both individual
 * segments and complete paths, since it simply replaces escape sequences wherever they occur.
 * For paths, each segment within the path will be unescaped individually.
 *
 * **Unescape Mappings:**
 * - `~0` → `~` (RFC 6901 standard)
 * - `~1` → `/` (RFC 6901 standard)
 * - `~2` → `..` (Custom: parent directory)
 * - `~3` → `.` (Custom: current directory)
 * - `~4` → `*` (Custom: wildcard/all indices)
 * - `~5` → `#` (Custom: root fragment identifier)
 *
 * @example
 * ```typescript
 * // Individual segment unescaping
 * unescapeSegment('name~3first')     // 'name.first'
 * unescapeSegment('path~1to')        // 'path/to'
 * unescapeSegment('parent~1~2')      // 'parent/..'
 * unescapeSegment('items~1~4')       // 'items/\*\'
 * unescapeSegment('~0already')       // '~already'
 * unescapeSegment('safe_name')       // 'safe_name' (no unescaping needed)
 *
 * // Full path unescaping (also works)
 * unescapeSegment('/user/name~3first/address')  // '/user/name.first/address'
 * unescapeSegment('/items/~4/value')            // '/items/\*\/value'
 * ```
 *
 * @param segment - The escaped segment or path to unescape.
 * @returns The unescaped string with escape sequences converted back to special characters.
 *
 * @see {@link escapeSegment} for the reverse operation
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6901#section-4} RFC 6901 - Evaluation rules
 */
export const unescapePointer = (segment: string) => {
  if (segment.indexOf(TILDE) === -1) return segment;
  return segment.replace(ESCAPE_PATTERN, replaceEscape);
};

/**
 * Replaces individual escape sequences with their corresponding characters.
 *
 * This function is used as a callback for the `replace` method in `unescapeSegment`.
 * It maps each escape sequence to its corresponding special character according to
 * both RFC 6901 standard and custom extensions.
 *
 * @param segment - The escape sequence to replace (e.g., '~0', '~1', etc.).
 * @returns The corresponding unescaped character or the original sequence if unknown.
 *
 * @internal This function is used internally by {@link unescapeSegment}.
 */
const replaceEscape = (segment: string) => {
  if (segment === ESCAPE_TILDE) return TILDE;
  if (segment === ESCAPE_CHILD) return JSONPointer.Child;
  if (segment === ESCAPE_PARENT) return JSONPointer.Parent;
  if (segment === ESCAPE_CURRENT) return JSONPointer.Current;
  if (segment === ESCAPE_INDEX) return JSONPointer.Index;
  if (segment === ESCAPE_ROOT) return JSONPointer.Root;
  return segment;
};
