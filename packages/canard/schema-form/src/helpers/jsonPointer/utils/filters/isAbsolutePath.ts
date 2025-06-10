/**
 * Checks if a JSON Pointer path is an absolute path.
 * @param path - The JSON Pointer path to check.
 * @note Use string literal type to check faster.
 * @returns True if the path is an absolute path, false otherwise.
 */
export const isAbsolutePath = (path: string): boolean =>
  path[0] === '/' || (path[0] === '#' && path[1] === '/');
