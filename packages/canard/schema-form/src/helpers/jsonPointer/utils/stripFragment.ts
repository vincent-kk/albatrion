import { JSONPointer as $ } from '../constants/JSONPointer';

/**
 * Strip the fragment prefix while retaining empty-name path segments.
 * @param path - The path to strip the fragment from.
 * @note Use string literal type to execute faster.
 * @param preserveAbsoluteRoot - Keep `#` when a dependency registry needs its absolute origin.
 * @note Only `#` is the fragment root; `/` and `#/` address an empty name.
 * @returns The normalized path without the fragment.
 */
export const stripFragment = (
  path: string,
  preserveAbsoluteRoot = false,
): string =>
  path[0] === $.Fragment
    ? preserveAbsoluteRoot && path.length === 1
      ? path
      : path.slice(1)
    : path;
