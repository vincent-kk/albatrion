import { isDescendantPath } from './isDescendantPath';

/**
 * Find the ancestor's direct child on the way to a descendant address.
 * @param path - Canonical address to shorten.
 * @param ancestorPath - Canonical ancestor address; the empty string is the root.
 * @returns The direct child address (path itself when it already is one), or undefined when path is not a strict descendant of the ancestor.
 */
export const getChildPointer = (
  path: string,
  ancestorPath: string,
): string | undefined => {
  if (!isDescendantPath(path, ancestorPath)) return undefined;
  const end = path.indexOf('/', ancestorPath.length + 1);
  return end < 0 ? path : path.slice(0, end);
};
