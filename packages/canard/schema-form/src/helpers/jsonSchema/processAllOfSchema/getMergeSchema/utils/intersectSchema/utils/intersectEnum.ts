import { intersection, intersectionWith } from '@winglet/common-utils/array';
import { equals } from '@winglet/common-utils/object';

import { JsonSchemaError } from '@/schema-form/errors';

/**
 * Enum 교집합을 처리합니다.
 */
export function intersectEnum<T>(
  baseEnum?: T[],
  sourceEnum?: T[],
  deepEqual?: boolean,
): T[] | undefined {
  if (!baseEnum && !sourceEnum) return undefined;
  if (!baseEnum) return sourceEnum;
  if (!sourceEnum) return baseEnum;

  const intersected = deepEqual
    ? intersectionWith(baseEnum, sourceEnum, equals)
    : intersection(baseEnum, sourceEnum);
  if (intersected.length === 0)
    throw new JsonSchemaError(
      'EMPTY_ENUM_INTERSECTION',
      'Enum values must have at least one common value',
    );
  return intersected;
}
