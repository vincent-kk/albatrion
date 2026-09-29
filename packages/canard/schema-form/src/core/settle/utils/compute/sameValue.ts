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
    Array.isArray(left) !== Array.isArray(right)) return false;
  if (!Array.isArray(left)) {
    const prototype = Object.getPrototypeOf(left);
    if (prototype !== Object.getPrototypeOf(right) ||
      (prototype !== Object.prototype && prototype !== null)) return false;
  }
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  return leftKeys.length === rightKeys.length &&
    leftKeys.every((key, index) => key === rightKeys[index] &&
      Object.is(Reflect.get(left, key), Reflect.get(right, key)));
};
