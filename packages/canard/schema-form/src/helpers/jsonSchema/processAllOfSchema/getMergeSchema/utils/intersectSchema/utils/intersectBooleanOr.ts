/**
 * 불린 OR 연산을 수행합니다 (하나라도 true면 true).
 */
export function intersectBooleanOr(
  baseBool?: boolean,
  sourceBool?: boolean,
): boolean | undefined {
  if (baseBool === undefined && sourceBool === undefined) return undefined;
  if (baseBool === undefined) return sourceBool;
  if (sourceBool === undefined) return baseBool;
  return baseBool || sourceBool;
}
