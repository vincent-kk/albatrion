import { CHILD, ESCAPE_CHILD, ESCAPE_TILDE, TILDE } from './constant';

/**
 * Escapes special characters in a JSON Pointer reference token according to RFC 6901.
 *
 * This function implements the character escaping mechanism defined in RFC 6901 specification
 * for JSON Pointer reference tokens. Since JSON Pointer uses specific characters (`~` and `/`)
 * as structural elements, these characters must be escaped when they appear as literal content
 * within reference tokens to avoid ambiguity in pointer interpretation.
 *
 * The escaping rules are straightforward and standardized:
 * - **Tilde character (`~`)** → **Escape sequence (`~0`)**
 * - **Forward slash (`/`)** → **Escape sequence (`~1`)**
 *
 * This escaping is essential for correctly handling object keys or array indices that contain
 * these special characters as literal content. Without proper escaping, a JSON Pointer parser
 * would incorrectly interpret these characters as structural delimiters rather than content.
 *
 * **Performance Optimization:**
 * The function includes an early exit optimization that checks for the presence of special
 * characters before processing. If neither `~` nor `/` characters are found in the input,
 * the original string is returned immediately without any processing overhead.
 *
 * **Processing Strategy:**
 * The function uses a character-by-character processing approach with pre-allocated arrays
 * for optimal performance, especially when dealing with longer strings that contain multiple
 * special characters requiring escaping.
 *
 * @param path - The reference token string to escape.
 *               Can contain any valid Unicode characters including the special characters
 *               that require escaping according to JSON Pointer specification.
 *               Empty strings and strings without special characters are handled efficiently.
 *
 * @returns The escaped reference token string with special characters properly encoded.
 *          If no special characters are present, returns the original string unchanged.
 *          The returned string is safe to use as a reference token in JSON Pointer expressions.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6901#section-3 - JSON Pointer escape sequences
 * @see https://datatracker.ietf.org/doc/html/rfc6901#section-4 - JSON Pointer evaluation
 *
 * @example
 * ```typescript
 * // Basic character escaping
 * escapePointer('foo~bar');
 * // Returns: "foo~0bar"
 *
 * escapePointer('foo/bar');
 * // Returns: "foo~1bar"
 * ```
 *
 * @example
 * ```typescript
 * // Multiple special characters
 * escapePointer('path~with/both~chars');
 * // Returns: "path~0with~1both~0chars"
 *
 * escapePointer('~/~/~/');
 * // Returns: "~0~1~0~1~0~1"
 * ```
 *
 * @example
 * ```typescript
 * // Edge cases and performance optimization
 * escapePointer('');
 * // Returns: "" (empty string, no processing needed)
 *
 * escapePointer('normal_key_123');
 * // Returns: "normal_key_123" (no special chars, early exit)
 *
 * escapePointer('user@domain.com');
 * // Returns: "user@domain.com" (no special chars, early exit)
 * ```
 *
 * @example
 * ```typescript
 * // Real-world usage scenarios
 * const objectKey = 'config/database';
 * const escapedKey = escapePointer(objectKey);
 * // escapedKey: "config~1database"
 * // Can now be safely used in JSON Pointer: `/settings/${escapedKey}/host`
 *
 * const fileName = 'backup~2023-12-01.json';
 * const escapedFileName = escapePointer(fileName);
 * // escapedFileName: "backup~02023-12-01.json"
 * // Can now be safely used in JSON Pointer: `/files/${escapedFileName}/size`
 * ```
 *
 * @example
 * ```typescript
 * // Integration with JSON Pointer operations
 * const data = {
 *   "files/docs": { size: 1024 },
 *   "config~prod": { database: "localhost" }
 * };
 *
 * // These keys need escaping when used in JSON Pointers
 * const escapedFileKey = escapePointer('files/docs');     // "files~1docs"
 * const escapedConfigKey = escapePointer('config~prod');  // "config~0prod"
 *
 * // Now safe to use in JSON Pointer expressions
 * const filePointer = `/${escapedFileKey}/size`;      // "/files~1docs/size"
 * const configPointer = `/${escapedConfigKey}/database`; // "/config~0prod/database"
 * ```
 */
export const escapeSegment = (path: string): string => {
  if (path.indexOf(CHILD) === -1 && path.indexOf(TILDE) === -1) return path;
  const length = path.length;
  const result: string[] = new Array(length);
  for (let index = 0; index < length; index++) {
    const char = path[index];
    if (char === TILDE) result[index] = ESCAPE_TILDE;
    else if (char === CHILD) result[index] = ESCAPE_CHILD;
    else result[index] = char;
  }
  return result.join('');
};
