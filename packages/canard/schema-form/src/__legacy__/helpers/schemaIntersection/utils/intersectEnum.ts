import {
  intersectionLite,
  intersectionWith,
} from '@winglet/common-utils/array';
import { equals } from '@winglet/common-utils/object';

import { EMPTY_INTERSECTION } from './constant';

/**
 * Intersect enum constraints without owning the caller's error policy.
 * @param baseEnum - Earlier optional JSON value list
 * @param sourceEnum - Later optional JSON value list
 * @param deepEqual - Select structural equality instead of reference equality
 * @returns Intersection, the only list unchanged, absence, or the empty marker
 */
export const intersectEnum = <T>(
  baseEnum?: readonly T[],
  sourceEnum?: readonly T[],
  deepEqual?: boolean,
): readonly T[] | undefined | typeof EMPTY_INTERSECTION => {
  if (!baseEnum) return sourceEnum;
  if (!sourceEnum) return baseEnum;
  const values = deepEqual
    ? intersectionWith(baseEnum, sourceEnum, equals)
    : intersectionLite(baseEnum, sourceEnum);
  return values.length ? values : EMPTY_INTERSECTION;
};
