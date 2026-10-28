import {
  PointerOperator,
  parsePointer,
} from '@/schema-form/helpers/jsonPointer';

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
  const left = parsePointer(watched).segments;
  const right = parsePointer(path).segments;
  const length = Math.min(left.length, right.length);
  for (let index = 0; index < length; index++) {
    const leftSegment = left[index];
    const rightSegment = right[index];
    if (
      leftSegment !== rightSegment &&
      !(
        leftSegment === PointerOperator.Wildcard &&
        typeof rightSegment === 'string' &&
        isCanonicalArrayIndex(rightSegment)
      )
    )
      return false;
  }
  return true;
};
