/**
 * Special character constants used in JSONPointer expressions
 * Based on RFC 6901 specification
 * @see https://datatracker.ietf.org/doc/html/rfc6901
 */
export const JSONPointer = {
  /**
   * Root pointer representing the entire document (empty string `''`)
   * @note In JSON String representation, `''` refers to the whole document.
   * @note In URI Fragment representation, `#` alone refers to the whole document.
   * @note `/` alone does NOT represent root - it references an empty string key `""`.
   * @see https://datatracker.ietf.org/doc/html/rfc6901#section-5
   */
  Root: '',
  /**
   * Starting character of URI fragment identifier (`#`)
   * @note `#` or `''` can be used as a root pointer.
   * @notice if you not want to use `#` as a root pointer, just start with `/`.
   * @see https://datatracker.ietf.org/doc/html/rfc6901#section-6
   */
  Fragment: '#',
  /**
   * Path separator character (`/`)
   * @see https://datatracker.ietf.org/doc/html/rfc6901#section-3
   */
  Separator: '/',
} as const;

export type JSONPointer = (typeof JSONPointer)[keyof typeof JSONPointer];
