import { isDescendantPath } from './isDescendantPath';

/** Keep just the direct child's address when path descends from this ancestor. */
export const getChildPointer = (
  path: string,
  ancestorPath: string,
): string | undefined => {
  if (!isDescendantPath(path, ancestorPath)) return undefined;
  const end = path.indexOf('/', ancestorPath.length + 1);
  return end < 0 ? path : path.slice(0, end);
};
