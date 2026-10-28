import { isAbsolutePath } from './isAbsolutePath';

/** Match the complete parsed pointer, including fragment roots and array prefixes. */
export const isAbsolutePointer = (
  pointer: string | readonly string[],
): boolean =>
  typeof pointer === 'string'
    ? pointer === '#' || isAbsolutePath(pointer)
    : pointer[0] === '#';
