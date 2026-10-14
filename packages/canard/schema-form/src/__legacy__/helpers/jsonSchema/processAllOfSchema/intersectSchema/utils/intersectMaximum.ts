import { intersectMaximum as intersect } from '@/schema-form/__legacy__/helpers/schemaIntersection';

/**
 * Intersects maximum constraints by selecting the smaller (more restrictive) value.
 *
 * This function combines maximum value constraints by choosing the minimum of the two values.
 * This creates the most restrictive upper bound that satisfies both constraints.
 *
 * @param baseMax - The base maximum value (optional)
 * @param sourceMax - The source maximum value (optional)
 * @returns The smaller maximum value, or undefined if both are undefined
 */
export const intersectMaximum = (
  baseMax?: number,
  sourceMax?: number,
): number | undefined => intersect(baseMax, sourceMax);
