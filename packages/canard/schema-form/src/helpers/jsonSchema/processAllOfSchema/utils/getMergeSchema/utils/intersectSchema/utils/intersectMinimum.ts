import { maxLite } from '@winglet/common-utils/math';

/**
 * 최소값들 중 가장 큰 값을 선택합니다.
 */
export function intersectMinimum(
  baseMin?: number,
  sourceMin?: number,
): number | undefined {
  if (baseMin === undefined && sourceMin === undefined) return undefined;
  if (baseMin === undefined) return sourceMin;
  if (sourceMin === undefined) return baseMin;
  return maxLite(baseMin, sourceMin);
}
