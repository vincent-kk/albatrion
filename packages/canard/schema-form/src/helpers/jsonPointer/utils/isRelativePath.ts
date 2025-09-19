import { JSONPointer } from '../enum';

/**
 * Checks if a JSON Pointer path is a relative path.
 * @param path - The JSON Pointer path to check.
 * @note Use string literal type to check faster.
 * @warning Relative path is not officially supported by JSON Pointer.
 * @returns True if the path is a relative path, false otherwise.
 *
 * @example
 * isRelativePath('/foo/bar') // false
 * isRelativePath('#/foo/bar') // false
 * isRelativePath('./foo/bar') // true
 * isRelativePath('../foo/bar') // true
 * isRelativePath('../foo/bar/baz') // true
 * isRelativePath('../../foo/bar/baz/qux') // true
 * isRelativePath('../../foo/bar/baz/qux/quux') // true
 * isRelativePath('../../foo/bar/baz/qux/quux/corge') // true
 */
export const isRelativePath = (pointer: string): boolean =>
  (pointer[0] === $C && pointer[1] === $S) ||
  (pointer[0] === $C && pointer[1] === $C && pointer[2] === $S);

const $S = JSONPointer.Separator;
const $C = JSONPointer.Current;
