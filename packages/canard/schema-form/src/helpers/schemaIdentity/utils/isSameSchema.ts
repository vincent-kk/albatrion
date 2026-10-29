import { isArray, isPlainObject } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Dictionary } from '@aileron/declare';

/** Compare authored values in key order, preserving identity of non-JSON atoms. */

export const isSameSchema = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object')
    return false;
  if (
    hasOwnProperty(left, '$$typeof') ||
    hasOwnProperty(right, '$$typeof') ||
    hasOwnProperty(left, 'current') ||
    hasOwnProperty(right, 'current')
  )
    return false;
  if (isArray(left) !== isArray(right)) return false;
  if (!isArray(left) && (!isPlainObject(left) || !isPlainObject(right)))
    return false;
  const keys = Object.keys(left);
  const otherKeys = Object.keys(right);
  if (keys.length !== otherKeys.length) return false;
  for (let index = 0, count = keys.length; index < count; index++) {
    const key = keys[index];

    if (
      !(
        key === otherKeys[index] &&
        isSameSchema(
          (left as Dictionary<unknown>)[key],
          (right as Dictionary<unknown>)[key],
        )
      )
    ) {
      return false;
    }
  }
  return true;
};
