/**
 * Special character constants used in JSONPointer expressions
 * Based on RFC 6901 specification
 * @see https://datatracker.ietf.org/doc/html/rfc6901
 */
export const JSONPointer = {
  /**
   * Starting character of URI fragment identifier (`#`)
   * @note `#` or `''` can be used as a root pointer.
   * @notice if you not want to use `#` as a root pointer, just start with `/`.
   * @see https://datatracker.ietf.org/doc/html/rfc6901#section-6
   */
  Root: '#',
  /**
   * Path separator character (`/`)
   * @see https://datatracker.ietf.org/doc/html/rfc6901#section-3
   */
  Child: '/',
} as const;

export type JSONPointer = (typeof JSONPointer)[keyof typeof JSONPointer];
