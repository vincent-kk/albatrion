import { JSONPointer as $ } from '../enum';

/**
 * Strips the fragment from the path.
 * @param path - The path to strip the fragment from.
 * @note Use string literal type to execute faster.
 * @returns The path without the fragment.
 */
export const stripFragment = (path: string): string =>
  path[0] === $.Fragment ? (path[1] ? path.slice(1) : $.Separator) : path;
