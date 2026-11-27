import { minLite } from '@winglet/common-utils/math';

import {
  JSONPointer as $,
  PointerOperator,
  type PointerSegment,
  parsePointerSegments,
} from '@/schema-form/helpers/jsonPointer';

import { isCanonicalArrayIndex } from './isCanonicalArrayIndex';

/**
 * Compare an authored watch with a live path in both ancestor directions.
 * @param watched - Absolute escaped pointer whose wildcards denote array indices
 * @param path - Absolute escaped live pointer affected by a presence change
 * @param watchedSegments - Prepared syntax from the authored watch owner
 * @param pathSegments - Prepared syntax from the querying runtime
 * @returns Whether the pointers intersect; wildcards accept only canonical indices
 */
export const intersectsWatchedPath = (
  watched: string,
  path: string,
  watchedSegments?: readonly PointerSegment[],
  pathSegments?: readonly PointerSegment[],
): boolean => {
  if (watched === $.Root || path === $.Root) return true;
  const left = watchedSegments ?? parsePointerSegments(watched);
  const right = pathSegments ?? parsePointerSegments(path);
  const length = minLite(left.length, right.length);
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
