import { JSONPointer as $ } from '../enum';

/**
 * Strips the fragment from the path and normalizes root representations.
 * @param path - The path to strip the fragment from.
 * @note Use string literal type to execute faster.
 * @note `#`, `#/`, `/` alone are treated as root and normalized to `''`.
 * @returns The normalized path without the fragment.
 */
export const stripFragment = (path: string): string =>
  path[0] === $.Fragment
    ? path[2] !== undefined
      ? path.slice(1)
      : $.Root
    : path === $.Separator
      ? $.Root
      : path;
