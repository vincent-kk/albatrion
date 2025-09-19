import { JSONPointer } from '../enum';

/**
 * Strips the fragment from the path.
 * @param path - The path to strip the fragment from.
 * @note Use string literal type to execute faster.
 * @returns The path without the fragment.
 */
export const stripFragment = (path: string): string =>
  path[0] === $F ? (path[1] ? path.slice(1) : $S) : path;

const $F = JSONPointer.Fragment;
const $S = JSONPointer.Separator;
