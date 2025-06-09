import {
  CHILD,
  TILDE,
  UNESCAPE_CHILD_KEY,
  UNESCAPE_TILDE_KEY,
} from './constant';

/**
 * Unescapes a JSON Pointer segment or path by converting escape sequences back to original characters.
 *
 * This function reverses the escaping process, converting `~0` to `~` and `~1` to `/`
 * as defined by RFC 6901. It uses a performance-optimized for-loop that avoids
 * regular expressions, making it efficient for frequent use.
 *
 * An optimization check is performed first: if the input contains no tilde characters,
 * it returns the original string immediately.
 *
 * **Note**: While named `unescapeSegment`, this function can unescape both individual
 * segments and complete paths, as it replaces escape sequences wherever they appear.
 *
 * **Unescape Mappings (RFC 6901):**
 * - `~0` → `~`
 * - `~1` → `/`
 *
 * @example
 * ```typescript
 * // Unescapes standard RFC 6901 sequences
 * unescapeSegment('a~0b')     // 'a~b'
 * unescapeSegment('c~1d')     // 'c/d'
 *
 * // Handles multiple sequences
 * unescapeSegment('~0~1')     // '~/'
 *
 * // Returns the original string if no tildes are present
 * unescapeSegment('safe_segment') // 'safe_segment'
 *
 * // Ignores invalid escape sequences
 * unescapeSegment('invalid~2sequence') // 'invalid~2sequence'
 * ```
 *
 * @param segment - The escaped segment or path to unescape.
 * @returns The unescaped string with RFC 6901 escape sequences converted back.
 *
 * @see {@link escapeSegment} for the reverse operation.
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6901#section-4} RFC 6901 - Evaluation rules.
 */
export const unescapeSegment = (segment: string): string => {
  if (segment.indexOf(TILDE) === -1) return segment;

  const result: string[] = [];
  for (let index = 0; index < segment.length; index++) {
    const character = segment[index];
    if (character === TILDE && index + 1 < segment.length) {
      const nextCharacter = segment[index + 1];
      if (
        nextCharacter === UNESCAPE_TILDE_KEY ||
        nextCharacter === UNESCAPE_CHILD_KEY
      ) {
        result[result.length] =
          nextCharacter === UNESCAPE_TILDE_KEY ? TILDE : CHILD;
        index++;
      } else result[result.length] = character;
    } else result[result.length] = character;
  }
  return result.join('');
};
