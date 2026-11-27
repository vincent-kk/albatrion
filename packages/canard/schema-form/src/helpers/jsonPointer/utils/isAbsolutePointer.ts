import { JSONPointer as $ } from '../constants/JSONPointer';
import { isAbsolutePath } from './isAbsolutePath';

/**
 * Decide whether an address is absolute without parsing it.
 * @param pointer - An address string, or an array of raw segments.
 * @returns True for `#`, a string starting with `/` or `#/`, or an array whose first element is `#`.
 */
export const isAbsolutePointer = (
  pointer: string | readonly string[],
): boolean =>
  typeof pointer === 'string'
    ? pointer === $.Fragment || isAbsolutePath(pointer)
    : pointer[0] === $.Fragment;
