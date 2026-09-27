import { JSONSchemaError } from '@/schema-form/errors';
import { formatConflictingConstValuesError } from '@/schema-form/helpers/error';
import {
  EMPTY_INTERSECTION,
  intersectConst as intersect,
} from '@/schema-form/helpers/schemaIntersection';

/**
 * Intersects two optional const values, ensuring they are structurally equal or throwing an error.
 *
 * This function handles the intersection of const values in JSON Schema.
 * Since const values represent exact matches, two different const values
 * cannot be intersected and will result in an error.
 *
 * @param baseConst - The base const value (optional)
 * @param sourceConst - The source const value (optional)
 * @returns The earlier equal reference, the sole defined value, or undefined if neither exists
 * @throws {JSONSchemaError} When both values are defined but different
 */
export const intersectConst = <T>(
  baseConst?: T,
  sourceConst?: T,
): T | undefined => {
  const result = intersect(baseConst, sourceConst);
  if (result === EMPTY_INTERSECTION)
    throw new JSONSchemaError(
      'CONFLICTING_CONST_VALUES',
      formatConflictingConstValuesError(baseConst, sourceConst),
    );
  return result;
};
