/**
 * Performs boolean OR intersection operation on two optional boolean values.
 *
 * This function implements the logical OR operation for boolean constraints,
 * where if either value is true, the result is true. This is commonly used
 * for properties like `uniqueItems` where the more restrictive constraint
 * (true) should take precedence.
 *
 * @param baseBool - The base boolean value (optional)
 * @param sourceBool - The source boolean value (optional)
 * @returns The OR result, or undefined if both inputs are undefined
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
