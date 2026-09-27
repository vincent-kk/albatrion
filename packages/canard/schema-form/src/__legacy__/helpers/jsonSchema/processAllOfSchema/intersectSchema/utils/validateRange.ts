import { JSONSchemaError } from '@/schema-form/errors';
import { formatInvalidRangeError } from '@/schema-form/helpers/error';
import {
  EMPTY_INTERSECTION,
  validateRange as validate,
} from '@/schema-form/helpers/schemaIntersection';

/**
 * Validates that a minimum value is not greater than a maximum value.
 *
 * This function ensures that range constraints are logically consistent.
 * It throws an error if the minimum value exceeds the maximum value,
 * which would create an impossible constraint.
 *
 * @param min - The minimum value (optional)
 * @param max - The maximum value (optional)
 * @param errorMessage - Custom error message prefix
 * @returns Nothing when the range is valid
 * @throws {JSONSchemaError} When min > max, creating an invalid range
 */
export const validateRange = (
  min?: number,
  max?: number,
  errorMessage: string = 'Invalid range: min > max',
): void => {
  if (min === undefined || max === undefined) return;
  if (validate(min, max) === EMPTY_INTERSECTION)
    throw new JSONSchemaError(
      'INVALID_RANGE',
      formatInvalidRangeError(min, max, errorMessage),
    );
};
