import { equals } from '@winglet/common-utils/object';

import { EMPTY_INTERSECTION } from './constant';

/**
 * Intersect exact JSON values by structural equality.
 * @param baseConst - Earlier value; undefined means no constraint
 * @param sourceConst - Later value; undefined means no constraint
 * @returns The earlier equal reference, the sole value, or the empty marker
 */
export const intersectConst = <T>(
  baseConst?: T,
  sourceConst?: T,
): T | undefined | typeof EMPTY_INTERSECTION => {
  if (baseConst === undefined) return sourceConst;
  if (sourceConst === undefined) return baseConst;
  return equals(baseConst, sourceConst) ? baseConst : EMPTY_INTERSECTION;
};
