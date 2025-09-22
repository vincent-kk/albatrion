import { lcm } from '@winglet/common-utils/math';

/**
 * MultipleOf 값들의 최소공배수를 계산합니다.
 */
export function intersectMultipleOf(
  baseMultiple?: number,
  sourceMultiple?: number,
): number | undefined {
  if (baseMultiple === undefined && sourceMultiple === undefined)
    return undefined;
  if (baseMultiple === undefined) return sourceMultiple;
  if (sourceMultiple === undefined) return baseMultiple;
  return lcm(baseMultiple, sourceMultiple);
}
