import { isCanonicalArrayIndex } from './isCanonicalArrayIndex';

/**
 * Compare an authored watch with a live path in both ancestor directions.
 * @param watched - Absolute escaped pointer whose wildcards denote array indices
 * @param path - Absolute escaped live pointer affected by a presence change
 * @returns Whether the pointers intersect; wildcards accept only canonical indices
 */
export const intersectsWatchedPath = (
  watched: string,
  path: string,
): boolean => {
  if (watched === '' || path === '') return true;
  const left = watched.split('/');
  const right = path.split('/');
  const length = Math.min(left.length, right.length);
  for (let index = 1; index < length; index++)
    if (
      left[index] !== right[index] &&
      !(left[index] === '*' && isCanonicalArrayIndex(right[index]))
    )
      return false;
  return true;
};
