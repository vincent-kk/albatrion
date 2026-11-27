/**
 * Checks whether a MOVE would place a location inside itself: RFC 6902 4.4 forbids a `from`
 * that is a proper prefix of `path`. Identical pointers are allowed, because removing a
 * value and adding it back at the same location leaves the document unchanged.
 *
 * @param from - Source pointer of the MOVE
 * @param path - Target pointer of the MOVE
 * @returns true when `from` is a proper prefix of `path`
 */
export const isCircularMoveReference = (
  from: string,
  path: string,
): boolean => {
  // Empty string (root) is a prefix of any non-empty path
  if (from === '') return path !== '';

  // Check if 'from' is a proper prefix of 'path'
  // Example: '/a' is a prefix of '/a/b' but not '/ab'
  return path.startsWith(from + '/');
};
