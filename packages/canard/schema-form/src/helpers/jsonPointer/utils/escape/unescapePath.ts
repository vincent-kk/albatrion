import { JSONPointer } from '../../enum';
import { TILDE } from './constant';

/**
 * Unescapes a JSON Pointer segment or path by converting escape sequences back to original characters.
 *
 * This function reverses the escaping process, converting escape sequences back to
 * their original special characters. It performs an optimization check first - if
 * the input contains no tilde characters, it returns the original string immediately.
 *
 * **Note**: While named `unescapePath`, this function can be used for both individual
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
 * unescapePath('name~3first')     // 'name.first'
 * unescapePath('path~1to')        // 'path/to'
 * unescapePath('parent~1~2')      // 'parent/..'
 * unescapePath('items~1~4')       // 'items/\*\'
 * unescapePath('~0already')       // '~already'
 * unescapePath('safe_name')       // 'safe_name' (no unescaping needed)
 *
 * // Full path unescaping (also works)
 * unescapePath('/user/name~3first/address')  // '/user/name.first/address'
 * unescapePath('/items/~4/value')            // '/items/\*\/value'
 * ```
 *
 * @param segment - The escaped segment or path to unescape.
 * @returns The unescaped string with escape sequences converted back to special characters.
 *
 * @see {@link escapeSegment} for the reverse operation
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6901#section-4} RFC 6901 - Evaluation rules
 */
export const unescapePath = (segment: string): string => {
  if (segment.indexOf(TILDE) === -1) return segment;
  let result = '';
  const length = segment.length;
  for (let index = 0; index < length; index++) {
    const character = segment[index];
    if (character === TILDE && index + 1 < length) {
      const next = segment[++index];
      if (next === ESCAPE_TILDE_VALUE) result += TILDE;
      else if (next === ESCAPE_FRAGMENT_VALUE) result += JSONPointer.Fragment;
      else if (next === ESCAPE_SEPARATOR_VALUE) result += JSONPointer.Separator;
      else if (next === ESCAPE_PARENT_VALUE) result += JSONPointer.Parent;
      else if (next === ESCAPE_CURRENT_VALUE) result += JSONPointer.Current;
      else if (next === ESCAPE_INDEX_VALUE) result += JSONPointer.Index;
      else result += character + next;
    } else result += character;
  }

  return result;
};

const ESCAPE_TILDE_VALUE = '0';
const ESCAPE_SEPARATOR_VALUE = '1';
const ESCAPE_PARENT_VALUE = '2';
const ESCAPE_CURRENT_VALUE = '3';
const ESCAPE_INDEX_VALUE = '4';
const ESCAPE_FRAGMENT_VALUE = '5';
