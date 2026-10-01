import { isArray } from '@winglet/common-utils/filter';

/**
 * Compare nested JSON-like values while retaining equal references without descent.
 * @param left - Value from the previous commit
 * @param right - Value assembled during the current calculation
 * @returns Whether their ordered plain contents are identical
 */
export const sameValue = (left: unknown, right: unknown): boolean => {
  if (left === right || Number.isNaN(left) && Number.isNaN(right)) return true;
  if (left === null || right === null ||
    typeof left !== 'object' || typeof right !== 'object' ||
    isArray(left) !== isArray(right)) return false;
  if (isArray(left) && isArray(right)) {
    if (left.length !== right.length) return false;
    for (let index = 0; index < left.length; index++)
      if (!sameValue(left[index], right[index])) return false;
    return true;
  }
  if (!isArray(left)) {
    const prototype = Object.getPrototypeOf(left);
    if (prototype !== Object.getPrototypeOf(right) ||
      (prototype !== Object.prototype && prototype !== null)) return false;
  }
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;
  for (let index = 0; index < leftKeys.length; index++) {
    const key = leftKeys[index];
    if (key !== rightKeys[index] ||
      !sameValue(Reflect.get(left, key), Reflect.get(right, key))) return false;
  }
  return true;
};
