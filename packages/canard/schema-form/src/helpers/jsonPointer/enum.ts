import { JSONPointer as OfficialJSONPointer } from '@winglet/json/pointer';

export const JSONPointer = {
  /**
   * Root pointer representing the entire document (empty string `''`)
   * @note In JSON String representation, `''` refers to the whole document.
   * @note In URI Fragment representation, `#` alone refers to the whole document.
   * @note `/` alone does NOT represent root - it references an empty string key `""`.
   * @see https://datatracker.ietf.org/doc/html/rfc6901#section-5
   */
  Root: OfficialJSONPointer.Root,
  /**
   * Starting character of URI fragment identifier (`#`)
   * @note `#` or `''` can be used as a root pointer.
   * @notice if you not want to use `#` as a root pointer, just start with `/`.
   * @see https://datatracker.ietf.org/doc/html/rfc6901#section-6
   */
  Fragment: OfficialJSONPointer.Fragment,
  /**
   * Path separator character (`/`)
   * @see https://datatracker.ietf.org/doc/html/rfc6901#section-3
   */
  Separator: OfficialJSONPointer.Separator,
  /**
   * Parent node (`..`)
   * @note This is not a official JSONPointer syntax, but it is used in some implementations.
   */
  Parent: '..',
  /**
   * Current node (`.`)
   * @note This is not a official JSONPointer syntax, but it is used in some implementations.
   */
  Current: '.',
  /**
   * All index operator (`*`)
   * @note This is not a official JSONPointer syntax, but it is used in some implementations.
   */
  Index: '*',
  /**
   * Special symbol for Context (`@`)
   * @note This is not a official JSONPointer syntax, but it is used in some implementations.
   */
  Context: '@',
} as const;

export type JSONPointer = (typeof JSONPointer)[keyof typeof JSONPointer];
