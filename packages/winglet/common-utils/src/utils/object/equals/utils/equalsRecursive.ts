import { OBJECT_TAG } from '@/common-utils/constant/typeTag';
import { getTypeTag } from '@/common-utils/libs/getTypeTag';
import { hasOwnProperty } from '@/common-utils/libs/hasOwnProperty';

import { countRetainedKeys } from './countRetainedKeys';
import { equalsBuiltin } from './equalsBuiltin';
import { equalsDeep } from './equalsRecursive/equalsDeep';

/**
 * Sentinel used to bypass internal-state tag checks for current-realm
 * literal-prototype pairs.
 */
const OBJECT_PROTOTYPE = Object.prototype;

/** Nesting depth from which `equalsDeep` continues the comparison on its own stack. */
const RECURSION_LIMIT = 256;

/**
 * Recursively compares the deep equality of two values, front to back, and stops at the
 * first mismatch, so values after it are never read.
 *
 * Below {@link RECURSION_LIMIT} levels the comparison recurses without tracking the
 * current path; from that depth `equalsDeep` continues it on an explicit cursor stack and
 * rejects a container pair that repeats on the current path. A cycle therefore descends
 * to that depth before it is reported.
 *
 * @param left - First value to compare
 * @param right - Second value to compare
 * @param omits - Set of property keys to exclude from comparison
 * @param depth - Nesting depth of `left` and `right` below the root operands; the root
 *   call omits it
 * @returns true if the two values are equal, false otherwise
 * @throws {RangeError} When a container pair repeats on the current comparison path
 */
export const equalsRecursive = (
  left: unknown,
  right: unknown,
  omits: Set<PropertyKey> | null,
  depth = 0,
): boolean => {
  if (left === right || (left !== left && right !== right)) return true;
  if (
    left === null ||
    right === null ||
    typeof left !== 'object' ||
    typeof right !== 'object'
  )
    return false;
  if (depth >= RECURSION_LIMIT) return equalsDeep(left, right, omits);

  const leftIsArray = Array.isArray(left);
  const rightIsArray = Array.isArray(right);

  if (leftIsArray !== rightIsArray) return false;

  if (leftIsArray && rightIsArray) {
    const length = left.length;
    if (length !== right.length) return false;
    for (let i = 0; i < length; i++)
      if (!equalsRecursive(left[i], right[i], omits, depth + 1)) return false;
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
        equalsRecursive(leftValue, rightValue, omits, depth + 1),
      );
      if (byState !== undefined) return byState;
    }
  }

  const leftObject = left as Record<PropertyKey, unknown>;
  const rightObject = right as Record<PropertyKey, unknown>;
  const keys = Object.keys(leftObject);
  const rightKeys = Object.keys(rightObject);
  const length = keys.length;

  if (omits === null) {
    if (length !== rightKeys.length) return false;
  } else if (
    countRetainedKeys(keys, omits) !== countRetainedKeys(rightKeys, omits)
  )
    return false;

  for (let i = 0; i < length; i++) {
    const key = keys[i];
    if (omits !== null && omits.has(key)) continue;
    if (
      !hasOwnProperty(rightObject, key) ||
      !equalsRecursive(leftObject[key], rightObject[key], omits, depth + 1)
    )
      return false;
  }

  return true;
};
