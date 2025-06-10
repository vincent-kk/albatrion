import { SEPARATOR, TILDE } from './constant';

/**
 * Unescapes JSON Pointer escape sequences in a reference token according to RFC 6901.
 *
 * This function implements the character unescaping mechanism defined in RFC 6901 specification
 * for JSON Pointer reference tokens. It reverses the escaping process by converting escape
 * sequences back to their original literal characters, enabling proper interpretation of
 * reference tokens that contain special characters as actual content.
 *
 * The unescaping rules follow the JSON Pointer standard:
 * - **Escape sequence (`~0`)** → **Tilde character (`~`)**
 * - **Escape sequence (`~1`)** → **Forward slash (`/`)**
 *
 * This unescaping is crucial for correctly resolving JSON Pointer references where object keys
 * or array indices contain literal `~` or `/` characters. During JSON Pointer evaluation,
 * escaped reference tokens must be unescaped to match the actual property names in the target
 * JSON document.
 *
 * **Performance Optimization:**
 * The function includes an early exit optimization that checks for the presence of tilde
 * characters before processing. If no `~` characters are found in the input, the original
 * string is returned immediately, avoiding unnecessary regex operations and processing overhead.
 *
 * **Processing Strategy:**
 * The function uses a regex-based replacement approach with a dedicated replacement function
 * for efficient and reliable escape sequence detection and conversion. The regex pattern
 * `/~[01]/g` specifically matches valid escape sequences while ignoring malformed patterns.
 *
 * **Error Handling:**
 * Invalid escape sequences (e.g., `~2`, `~a`) are left unchanged rather than throwing errors,
 * following a graceful degradation approach. This behavior aligns with the robustness principle
 * of handling edge cases without disrupting the overall JSON Pointer resolution process.
 *
 * @param path - The escaped reference token string to unescape.
 *               Should contain escape sequences (`~0` and `~1`) that need to be converted
 *               back to their literal character equivalents (`~` and `/` respectively).
 *               Strings without escape sequences are handled efficiently with early exit.
 *
 * @returns The unescaped reference token string with escape sequences converted to literal characters.
 *          If no escape sequences are present, returns the original string unchanged.
 *          The returned string represents the actual key/index content for JSON document access.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6901#section-3 - JSON Pointer escape sequences
 * @see https://datatracker.ietf.org/doc/html/rfc6901#section-4 - JSON Pointer evaluation
 *
 * @example
 * ```typescript
 * // Basic escape sequence unescaping
 * unescapePath('foo~0bar');
 * // Returns: "foo~bar"
 *
 * unescapePath('foo~1bar');
 * // Returns: "foo/bar"
 * ```
 *
 * @example
 * ```typescript
 * // Multiple escape sequences
 * unescapePath('path~0with~1both~0chars');
 * // Returns: "path~with/both~chars"
 *
 * unescapePath('~0~1~0~1~0~1');
 * // Returns: "~/~/~/"
 * ```
 *
 * @example
 * ```typescript
 * // Edge cases and performance optimization
 * unescapePath('');
 * // Returns: "" (empty string, no processing needed)
 *
 * unescapePath('normal_key_123');
 * // Returns: "normal_key_123" (no tildes, early exit)
 *
 * unescapePath('user@domain.com');
 * // Returns: "user@domain.com" (no tildes, early exit)
 * ```
 *
 * @example
 * ```typescript
 * // Invalid or malformed escape sequences (graceful handling)
 * unescapePath('invalid~2sequence');
 * // Returns: "invalid~2sequence" (invalid sequence left unchanged)
 *
 * unescapePath('incomplete~sequence');
 * // Returns: "incomplete~sequence" (incomplete sequence left unchanged)
 *
 * unescapePath('mixed~0valid~2invalid~1valid');
 * // Returns: "mixed~valid~2invalid/valid" (only valid sequences processed)
 * ```
 *
 * @example
 * ```typescript
 * // Real-world JSON Pointer resolution scenarios
 * const escapedKey = 'config~1database';
 * const actualKey = unescapePath(escapedKey);
 * // actualKey: "config/database"
 * // Now matches the actual object property name
 *
 * const escapedFileName = 'backup~02023-12-01.json';
 * const actualFileName = unescapePath(escapedFileName);
 * // actualFileName: "backup~2023-12-01.json"
 * // Now matches the actual file name in the data structure
 * ```
 *
 * @example
 * ```typescript
 * // Integration with JSON Pointer evaluation
 * const data = {
 *   "files/docs": { size: 1024 },
 *   "config~prod": { database: "localhost" }
 * };
 *
 * // During JSON Pointer evaluation, escaped tokens are unescaped
 * const filePointer = "/files~1docs/size";
 * const escapedFileKey = "files~1docs";  // From pointer parsing
 * const actualFileKey = unescapePath(escapedFileKey);  // "files/docs"
 *
 * console.log(data[actualFileKey].size); // 1024
 *
 * const configPointer = "/config~0prod/database";
 * const escapedConfigKey = "config~0prod";  // From pointer parsing
 * const actualConfigKey = unescapePath(escapedConfigKey);  // "config~prod"
 *
 * console.log(data[actualConfigKey].database); // "localhost"
 * ```
 */
export const unescapePath = (segment: string): string => {
  if (segment.indexOf(TILDE) === -1) return segment;
  let result = '';
  const length = segment.length;
  for (let index = 0; index < length; index++) {
    const current = segment[index];
    if (current === TILDE && index + 1 < length) {
      const next = segment[++index];
      if (next === ESCAPE_TILDE_VALUE) result += TILDE;
      else if (next === ESCAPE_SEPARATOR_VALUE) result += SEPARATOR;
      else result += current + next;
    } else result += current;
  }
  return result;
};

const ESCAPE_TILDE_VALUE = '0';
const ESCAPE_SEPARATOR_VALUE = '1';
