/**
 * Decide whether one canonical address lies strictly below another, without allocating a prefix.
 * @param path - Canonical address to test.
 * @param ancestorPath - Canonical address of the candidate ancestor; the empty string is the root.
 * @returns True only when path continues ancestorPath at a segment boundary; an equal address is not a descendant.
 */
export const isDescendantPath = (path: string, ancestorPath: string): boolean =>
  path.length > ancestorPath.length &&
  path[ancestorPath.length] === '/' &&
  path.startsWith(ancestorPath);
