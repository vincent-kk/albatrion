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
  const pending: unknown[] = [left, right];
  while (pending.length) {
    right = pending.pop();
    left = pending.pop();
    if (left === right || (left !== left && right !== right)) continue;
    if (left === null || right === null || typeof left !== 'object' || typeof right !== 'object')
      return false;
    const leftIsArray = Array.isArray(left);
    const rightIsArray = Array.isArray(right);
    if (leftIsArray !== rightIsArray) return false;
    if (Array.isArray(left) && Array.isArray(right)) {
      if (left.length !== right.length) return false;
      for (let i = left.length - 1; i >= 0; i--) {
        const leftValue: unknown = left[i];
        const rightValue: unknown = right[i];
        if (leftValue === rightValue || (leftValue !== leftValue && rightValue !== rightValue)) continue;
        pending.push(leftValue, rightValue);
      }
      continue;
    }
    if (Object.getPrototypeOf(left) !== OBJECT_PROTOTYPE || Object.getPrototypeOf(right) !== OBJECT_PROTOTYPE) {
      const tag = getTypeTag(left);
      if (tag !== getTypeTag(right)) return false;
      if (tag !== OBJECT_TAG) {
        const byState = equalsBuiltin(left, right, tag, (leftValue, rightValue) => {
          pending.push(leftValue, rightValue);
          return true;
        });
        if (byState === false) return false;
        if (byState === true) continue;
      }
    }
    const leftObject = left as Record<PropertyKey, unknown>;
    const rightObject = right as Record<PropertyKey, unknown>;
    const keys = Object.keys(leftObject);
    const rightKeys = Object.keys(rightObject);
    if (omits === null) {
      if (keys.length !== rightKeys.length) return false;
    } else if (countRetainedKeys(keys, omits) !== countRetainedKeys(rightKeys, omits)) return false;
    for (let i = keys.length - 1; i >= 0; i--) {
      const key = keys[i];
      if (omits?.has(key)) continue;
      if (!hasOwnProperty(rightObject, key)) return false;
      const leftValue = leftObject[key];
      const rightValue = rightObject[key];
      if (leftValue === rightValue || (leftValue !== leftValue && rightValue !== rightValue)) continue;
      pending.push(leftValue, rightValue);
    }
  }
  return true;
};
