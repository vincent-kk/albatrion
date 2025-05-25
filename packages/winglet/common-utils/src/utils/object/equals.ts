import { hasOwnProperty } from '@/common-utils/libs/hasOwnProperty';

/**
 * Compares two values for deep equality. (Optimized version)
 * Recursively compares the contents of objects and arrays, and also treats NaN === NaN as true.
 *
 * @param left - First value to compare
 * @param right - Second value to compare
 * @param omit - Set or array of property keys to exclude from comparison (optional)
 * @returns true if the two values are equal, false otherwise
 *
 * @example
 * equals({a: 1, b: 2}, {a: 1, b: 2}); // true
 * equals({a: 1, b: NaN}, {a: 1, b: NaN}); // true
 * equals({a: 1, b: 2}, {a: 1, b: 3}); // false
 * equals({a: 1, b: 2, c: 3}, {a: 1, b: 2}, ['c']); // true (ignores 'c' property)
 */
export const equals = (
  left: unknown,
  right: unknown,
  omit?: Set<PropertyKey> | Array<PropertyKey>,
): boolean => {
  const omits = omit ? (omit instanceof Set ? omit : new Set(omit)) : null;
  return equalsRecursive(left, right, omits);
};

/**
 * Recursively compares the deep equality of two values.
 *
 * @param left - First value to compare
 * @param right - Second value to compare
 * @param omits - Set of property keys to exclude from comparison
 * @returns true if the two values are equal, false otherwise
 */
const equalsRecursive = (
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
    for (let index = 0; index < length; index++)
      if (!equalsRecursive(left[index], right[index], omits)) return false;
    return true;
  }

  const keys = Object.keys(left);
  const length = keys.length;

  if (length !== Object.keys(right).length) return false;

  for (let index = 0; index < length; index++) {
    const key = keys[index];
    if (omits?.has(key)) continue;
    if (
      !hasOwnProperty(right, key) ||
      !equalsRecursive((left as any)[key], (right as any)[key], omits)
    )
      return false;
  }

  return true;
};
