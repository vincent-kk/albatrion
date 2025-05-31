/**
 * Checks if 'from' is a proper prefix of 'path' or if they are identical.
 *
 * @param from - Source path
 * @param path - Target path
 * @returns true if from is a proper prefix of path or they are identical
 */
export const isCircularMoveReference = (
  from: string,
  path: string,
): boolean => {
  // Identical paths (moving to self)
  if (from === path) return true;

  // Empty string (root) is a prefix of any non-empty path
  if (from === '' && path !== '') return true;

  // Check if 'from' is a proper prefix of 'path'
  // Example: '/a' is a prefix of '/a/b' but not '/ab'
  return path.startsWith(from + '/');
};
