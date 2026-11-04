import { JSONSchemaError } from '@/schema-form/__legacy__/errors';
import { formatEmptyEnumIntersectionError } from '@/schema-form/__legacy__/helpers/error';
import {
  EMPTY_INTERSECTION,
  intersectEnum as intersect,
} from '@/schema-form/__legacy__/helpers/schemaIntersection';

/**
 * Intersects two enum arrays, returning only values that exist in both arrays.
 *
 * This function finds the intersection of two enum arrays, with optional deep equality
 * comparison for complex values. An empty intersection throws an error as it would
 * create an impossible constraint.
 *
 * @param baseEnum - The base enum array (optional)
 * @param sourceEnum - The source enum array (optional)
 * @param deepEqual - Whether to use deep equality for complex values
 * @returns Intersected enum array, or undefined if both inputs are undefined
 * @throws {JSONSchemaError} When intersection results in empty array (impossible constraint)
 */
export const intersectEnum = <T>(
  baseEnum?: readonly T[],
  sourceEnum?: readonly T[],
  deepEqual?: boolean,
): readonly T[] | undefined => {
  if (!baseEnum) return sourceEnum;
  if (!sourceEnum) return baseEnum;
  const result = intersect(baseEnum, sourceEnum, deepEqual);
  if (result === EMPTY_INTERSECTION)
    throw new JSONSchemaError(
      'EMPTY_ENUM_INTERSECTION',
      formatEmptyEnumIntersectionError(baseEnum, sourceEnum),
    );
  return result;
};
