import { TILDE, UNESCAPE_MAP } from './constant';

/**
 * Unescapes a JSON Pointer segment or path by converting escape sequences back to original characters.
 *
 * This function reverses the escaping process, converting escape sequences back to
 * their original special characters. It performs an optimization check first - if
 * the input contains no tilde characters, it returns the original string immediately.
 * This implementation uses a for-loop for performance, avoiding regular expressions.
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
export const unescapeSegment = (segment: string): string => {
  if (segment.indexOf(TILDE) === -1) return segment;

  const result: string[] = [];
  for (let index = 0; index < segment.length; index++) {
    const character = segment[index];
    if (character === TILDE && index + 1 < segment.length) {
      const nextCharacter = segment[index + 1];
      const unescaped = UNESCAPE_MAP[nextCharacter as keyof UNESCAPE_MAP];
      if (unescaped !== undefined) {
        result[result.length] = unescaped;
        index++;
      } else result[result.length] = character;
    } else result[result.length] = character;
  }
  return result.join('');
};
