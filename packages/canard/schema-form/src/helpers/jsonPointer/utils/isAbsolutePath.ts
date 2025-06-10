/**
 * Checks if a JSON Pointer path is an absolute path.
 * @param path - The JSON Pointer path to check.
 * @note Use string literal type to check faster.
 * @warning JSON Pointer only supports absolute paths.
 * @returns True if the path is an absolute path, false otherwise.
 *
 * @example
 * isAbsolutePath('/foo/bar') // true
 * isAbsolutePath('#/foo/bar') // true
 * isAbsolutePath('./foo/bar') // false
 * isAbsolutePath('../foo/bar') // false
 * isAbsolutePath('../../foo/bar') // false
 * isAbsolutePath('../../foo/bar/baz') // false
 */
export const isAbsolutePath = (pointer: string): boolean =>
  pointer[0] === '/' || (pointer[0] === '#' && pointer[1] === '/');
