/**
 * Special character constants used in JSONPointer expressions
 * Based on RFC 6901 specification
 */
export enum JSONPointer {
  /** Starting character of URI fragment identifier (#) */
  Root = '#',
  /** Path separator character (/) */
  Child = '/',
}
