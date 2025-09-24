import { minLite } from '@winglet/common-utils/math';

/**
 * 최대값들 중 가장 작은 값을 선택합니다.
 */
export function intersectMaximum(
  baseMax?: number,
  sourceMax?: number,
): number | undefined {
  if (baseMax === undefined && sourceMax === undefined) return undefined;
  if (baseMax === undefined) return sourceMax;
  if (sourceMax === undefined) return baseMax;
  return minLite(baseMax, sourceMax);
}
