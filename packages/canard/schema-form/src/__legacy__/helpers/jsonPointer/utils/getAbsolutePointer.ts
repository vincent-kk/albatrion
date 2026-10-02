import { JSONPointer as $ } from '../enum';
import { isAbsolutePath } from './isAbsolutePath';

/**
 * Converts a relative JSON Pointer path to an absolute path.
 * @param basePath - The base path (must be an absolute path starting with '/').
 * @param currentPath - The path to resolve (can be absolute or relative).
 * @returns The resolved absolute path.
 *
 * @example
 * // Absolute paths are returned as-is
 * getAbsolutePath('/foo/bar', '/baz') // '/baz'
 * getAbsolutePath('/foo/bar', '#/baz') // '#/baz'
 *
 * @example
 * // Current directory relative paths (./)
 * getAbsolutePath('/foo/bar', './baz') // '/foo/bar/baz'
 * getAbsolutePath('/foo/bar', './') // '/foo/bar'
 *
 * @example
 * // Parent directory relative paths (../)
 * getAbsolutePath('/foo/bar', '../baz') // '/foo/baz'
 * getAbsolutePath('/foo/bar/baz', '../../qux') // '/foo/qux'
 * getAbsolutePath('/foo', '../bar') // '/bar'
 */
export const getAbsolutePath = (
  basePath: string,
  currentPath: string,
): string => {
  // 1. Absolute paths are returned as-is
  if (isAbsolutePath(currentPath)) return currentPath;

  // Compute effective basePath end index (normalize trailing slash)
  const baseEndIndex =
    basePath.length > 1 && basePath[basePath.length - 1] === $.Separator
      ? basePath.length - 1
      : basePath.length;

  // 2. Current directory relative path (./)
  if (currentPath[0] === $.Current && currentPath[1] === $.Separator) {
    // No remaining path after './'
    if (currentPath.length === 2)
      return baseEndIndex > 0 ? basePath.slice(0, baseEndIndex) : $.Separator;
    // Avoid double slash when basePath is '/'
    return baseEndIndex === 1
      ? $.Separator + currentPath.slice(2)
      : basePath.slice(0, baseEndIndex) + $.Separator + currentPath.slice(2);
  }

  // 3. Parent directory relative path (../)
  if (
    currentPath[0] === $.Current &&
    currentPath[1] === $.Current &&
    currentPath[2] === $.Separator
  ) {
    let scanIndex = 0;
    let cutIndex = baseEndIndex;

    // Count ../ and find cut position simultaneously
    while (
      currentPath[scanIndex] === $.Current &&
      currentPath[scanIndex + 1] === $.Current &&
      currentPath[scanIndex + 2] === $.Separator
    ) {
      scanIndex += 3;
      if (cutIndex > 0) {
        cutIndex = basePath.lastIndexOf($.Separator, cutIndex - 1);
        if (cutIndex < 0) cutIndex = 0;
      }
    }

    // Build result: base (if any) + separator + remaining path (if any)
    if (scanIndex < currentPath.length)
      return cutIndex > 0
        ? basePath.slice(0, cutIndex) +
            $.Separator +
            currentPath.slice(scanIndex)
        : $.Separator + currentPath.slice(scanIndex);
    return cutIndex > 0 ? basePath.slice(0, cutIndex) : $.Separator;
  }

  // 4. Fallback: return currentPath as-is
  return currentPath;
};
