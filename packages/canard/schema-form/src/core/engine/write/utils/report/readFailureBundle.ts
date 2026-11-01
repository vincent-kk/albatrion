import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import { FormErrorCode, SchemaFormError } from '../../../../../errors';

/**
 * Snapshot a readable dense domain bundle before any host leaf is visited.
 * @param value - Any failure; unreadable shape or element access stays opaque.
 * @param budget - Shared inspection allowance, reserved before reads even if the snapshot fails.
 * @returns Own element identities, or undefined when the value is one leaf.
 */
export const readFailureBundle = (
  value: unknown,
  budget: { remaining: number },
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
    if (
      !Number.isInteger(length) ||
      length < 1 ||
      length > 0xffff_ffff ||
      length > budget.remaining
    )
      return undefined;
    budget.remaining -= length;
    const values: unknown[] = [];
    for (let index = 0; index < length; index++) {
      if (!hasOwnProperty(errors, index)) return undefined;
      values.push(errors[index]);
    }
    if (errors.length !== length) return undefined;
    return values;
  } catch {
    return undefined;
  }
};
