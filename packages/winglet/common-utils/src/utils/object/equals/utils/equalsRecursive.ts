import { OBJECT_TAG } from '@/common-utils/constant/typeTag';
import { getTypeTag } from '@/common-utils/libs/getTypeTag';
import { hasOwnProperty } from '@/common-utils/libs/hasOwnProperty';

import { countRetainedKeys } from './countRetainedKeys';
import { equalsBuiltin } from './equalsBuiltin';

/**
 * Sentinel used to bypass internal-state tag checks for current-realm
 * literal-prototype pairs.
 */
const OBJECT_PROTOTYPE = Object.prototype;

/**
 * Recursively compares the deep equality of two values.
 *
 * @param left - First value to compare
 * @param right - Second value to compare
 * @param omits - Set of property keys to exclude from comparison
 * @returns true if the two values are equal, false otherwise
 */
export const equalsRecursive = (
  left: unknown,
  right: unknown,
  omits: Set<PropertyKey> | null,
): boolean => {
  if (left === right || (left !== left && right !== right)) return true;

  if (
    left === null ||
    right === null ||
    typeof left !== 'object' ||
    typeof right !== 'object'
  )
    return false;

  const leftIsArray = Array.isArray(left);
  const rightIsArray = Array.isArray(right);

  if (leftIsArray !== rightIsArray) return false;

  if (leftIsArray && rightIsArray) {
    const length = left.length;
    if (length !== right.length) return false;
    for (let i = 0; i < length; i++)
      if (!equalsRecursive(left[i], right[i], omits)) return false;
    return true;
  }

  if (
    Object.getPrototypeOf(left) !== OBJECT_PROTOTYPE ||
    Object.getPrototypeOf(right) !== OBJECT_PROTOTYPE
  ) {
    // Built-ins keep their state in internal slots that own keys cannot see, so comparing
    // keys would call any two of them equal. Class instances carry OBJECT_TAG and stay
    // on the structural path below.
    const tag = getTypeTag(left);
    if (tag !== getTypeTag(right)) return false;
    if (tag !== OBJECT_TAG) {
      const byState = equalsBuiltin(left, right, tag, (leftValue, rightValue) =>
        equalsRecursive(leftValue, rightValue, omits),
      );
      if (byState !== undefined) return byState;
    }
  }

  const keys = Object.keys(left);
  const rightKeys = Object.keys(right);
  const length = keys.length;

  if (omits === null) {
    if (length !== rightKeys.length) return false;
  } else if (
    countRetainedKeys(keys, omits) !== countRetainedKeys(rightKeys, omits)
  )
    return false;

  for (let i = 0, k = keys[0]; i < length; i++, k = keys[i]) {
    if (omits?.has(k)) continue;
    if (
      !hasOwnProperty(right, k) ||
      !equalsRecursive((left as any)[k], (right as any)[k], omits)
    )
      return false;
  }

  return true;
};
