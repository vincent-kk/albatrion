import {
  intersectionLite,
  intersectionWith,
} from '@winglet/common-utils/array';
import { equals } from '@winglet/common-utils/object';

import { JsonSchemaError } from '@/schema-form/errors';
import { formatEmptyEnumIntersectionError } from '@/schema-form/helpers/error';

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
 * @throws {JsonSchemaError} When intersection results in empty array (impossible constraint)
 */
export const intersectEnum = <T>(
  baseEnum?: T[],
  sourceEnum?: T[],
  deepEqual?: boolean,
): T[] | undefined => {
  if (!baseEnum && !sourceEnum) return undefined;
  if (!baseEnum) return sourceEnum;
  if (!sourceEnum) return baseEnum;

  const intersected = deepEqual
    ? intersectionWith(baseEnum, sourceEnum, equals)
    : intersectionLite(baseEnum, sourceEnum);
  if (intersected.length === 0)
    throw new JsonSchemaError(
      'EMPTY_ENUM_INTERSECTION',
      formatEmptyEnumIntersectionError(baseEnum, sourceEnum),
    );
  return intersected;
};
