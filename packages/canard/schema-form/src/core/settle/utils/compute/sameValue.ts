import { isArray } from '@winglet/common-utils/filter';

/**
 * Compare calculated values while preserving an unchanged container reference.
 * @param left - Value from the previous commit
 * @param right - Value assembled during the current calculation
 * @returns Whether their ordered top-level contents are identical
 */
export const sameValue = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;
  if (left === null || right === null ||
    typeof left !== 'object' || typeof right !== 'object' ||
    isArray(left) !== isArray(right)) return false;
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
      !Object.is(Reflect.get(left, key), Reflect.get(right, key))) return false;
  }
  return true;
};
