import { intersectMultipleOf as intersect } from '@/schema-form/__legacy__/helpers/schemaIntersection';

/**
 * Intersects multipleOf constraints by calculating their least common multiple (LCM).
 *
 * This function combines two multipleOf constraints by finding their LCM,
 * ensuring that the result is a multiple of both original values.
 * This creates the most restrictive valid constraint.
 *
 * JSON Schema requires `multipleOf` to be a finite number, so a non-finite value
 * carries no constraint and is treated as absent rather than propagated as `NaN`.
 *
 * @param baseMultiple - The base multipleOf value (optional)
 * @param sourceMultiple - The source multipleOf value (optional)
 * @returns LCM of both values, the sole constrained value when only one applies,
 *   or undefined when neither is a usable constraint
 */
export const intersectMultipleOf = (
  baseMultiple?: number,
  sourceMultiple?: number,
): number | undefined => intersect(baseMultiple, sourceMultiple);
