import {
  DATE_TAG,
  MAP_TAG,
  REGEXP_TAG,
  SET_TAG,
} from '@/common-utils/constant/typeTag';

/**
 * Compares two built-in objects that keep their state in internal slots.
 *
 * `Date`, `RegExp`, `Map` and `Set` expose no own enumerable keys, so a key-based
 * comparison reports every pair of them as identical. Each is compared through the
 * accessor that actually reads its state instead.
 *
 * Callers pass `compare` rather than importing the recursive comparator, which would
 * close a dependency cycle back into `equals`.
 *
 * @param left - First built-in object, already known to share `tag` with `right`
 * @param right - Second built-in object
 * @param tag - Shared `Object.prototype.toString` tag of both operands
 * @param compare - Recursive comparator applied to nested values
 * @returns Whether the two carry the same state, `false` for tags handled by reference
 *
 * @remarks
 * `Set` members and `Map` keys are matched by SameValueZero, so object members match
 * only by identity — structural matching would require an order-insensitive pairing
 * search and turn a linear comparison quadratic. `Map` values are compared recursively.
 * Any other tag (`ArrayBuffer`, `Error`, `Promise`, typed arrays, …) returns `false`;
 * identical references never reach this function.
 */
export const equalsBuiltin = (
  left: object,
  right: object,
  tag: string,
  compare: (left: unknown, right: unknown) => boolean,
): boolean => {
  if (tag === DATE_TAG) {
    const leftTime = (left as Date).getTime();
    const rightTime = (right as Date).getTime();
    // Invalid dates carry NaN, which is never equal to itself
    return (
      leftTime === rightTime || (leftTime !== leftTime && rightTime !== rightTime)
    );
  }
  if (tag === REGEXP_TAG)
    return (
      (left as RegExp).source === (right as RegExp).source &&
      (left as RegExp).flags === (right as RegExp).flags
    );
  if (tag === SET_TAG) {
    const leftSet = left as Set<unknown>;
    const rightSet = right as Set<unknown>;
    if (leftSet.size !== rightSet.size) return false;
    for (const member of leftSet) if (!rightSet.has(member)) return false;
    return true;
  }
  if (tag === MAP_TAG) {
    const leftMap = left as Map<unknown, unknown>;
    const rightMap = right as Map<unknown, unknown>;
    if (leftMap.size !== rightMap.size) return false;
    for (const [key, value] of leftMap)
      if (!rightMap.has(key) || !compare(value, rightMap.get(key))) return false;
    return true;
  }
  return false;
};
