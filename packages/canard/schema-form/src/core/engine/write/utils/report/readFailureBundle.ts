import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import { FormErrorCode, SchemaFormError } from '../../../../../errors';

/**
 * Snapshot a readable dense domain bundle before any host leaf is visited.
 * @param value - Any failure; unreadable shape or element access stays opaque.
 * @returns Own element identities, or undefined when the value is one leaf.
 */
export const readFailureBundle = (
  value: unknown,
): readonly unknown[] | undefined => {
  try {
    if (
      !(value instanceof SchemaFormError) ||
      value.code !== FormErrorCode.MultipleErrors
    )
      return undefined;
    const errors: unknown = value.details?.errors;
    if (!isArray(errors)) return undefined;
    const length = errors.length;
    if (length === 0) return undefined;
    const values: unknown[] = [];
    for (let index = 0; index < length; index++) {
      if (!hasOwnProperty(errors, index)) return undefined;
      values.push(errors[index]);
    }
    return values;
  } catch {
    return undefined;
  }
};
