/** Strict descendant comparison on canonical, encoded paths without a prefix allocation. */
export const isDescendantPath = (path: string, ancestorPath: string): boolean =>
  path.length > ancestorPath.length &&
  path[ancestorPath.length] === '/' &&
  path.startsWith(ancestorPath);
