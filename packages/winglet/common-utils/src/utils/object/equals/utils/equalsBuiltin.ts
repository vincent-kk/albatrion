import type { Fn } from '@aileron/declare';

import {
  ARRAY_BUFFER_TAG,
  BOOLEAN_TAG,
  DATA_VIEW_TAG,
  DATE_TAG,
  ERROR_TAG,
  MAP_TAG,
  NUMBER_TAG,
  REGEXP_TAG,
  SET_TAG,
  STRING_TAG,
} from '@/common-utils/constant/typeTag';

/**
 * Compares two built-in objects that keep their state in internal slots.
 *
 * `Date`, `RegExp`, `Map`, `Set`, `ArrayBuffer`, `DataView` and boxed primitives expose
 * no own enumerable keys for their state, so a key-based comparison reports every pair of
 * them as identical. Each is compared through the accessor that actually reads its state
 * instead. `Error` keeps `name` and `message` out of its enumerable keys as well.
 *
 * Callers pass `compare` rather than importing the recursive comparator, which would
 * close a dependency cycle back into `equals`.
 *
 * @param left - First built-in object, already known to share `tag` with `right`
 * @param right - Second built-in object
 * @param tag - Shared `Object.prototype.toString` tag of both operands
 * @param compare - Recursive comparator applied to nested values
 * @returns The final verdict for `Date`, `RegExp`, `Set` and `Map`; `false` when the
 *   bytes, boxed value or error `name` and `message` differ; otherwise `undefined`, and
 *   the caller goes on to compare own keys, so a matching state never hides own
 *   properties that differ
 *
 * @remarks
 * `Set` members and `Map` keys are matched by SameValueZero, so object members match
 * only by identity — structural matching would require an order-insensitive pairing
 * search and turn a linear comparison quadratic. `Map` values are compared recursively.
 * Boxed values are read through their own prototype `valueOf`, so an overridden
 * `valueOf` cannot change the result; a boxed `NaN` equals another boxed `NaN`.
 * Any other tag — typed arrays, a plain object carrying a custom `Symbol.toStringTag` —
 * returns `undefined` rather than `false`: those expose their state through own keys, so
 * refusing them here would report structurally identical values as unequal.
 */
export const equalsBuiltin = (
  left: object,
  right: object,
  tag: string,
  compare: Fn<[left: unknown, right: unknown], boolean>,
): boolean | undefined => {
  if (tag === DATE_TAG) {
    const leftTime = (left as Date).getTime();
    const rightTime = (right as Date).getTime();
    // Invalid dates carry NaN, which is never equal to itself
    return (
      leftTime === rightTime ||
      (leftTime !== leftTime && rightTime !== rightTime)
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
      if (!rightMap.has(key) || !compare(value, rightMap.get(key)))
        return false;
    return true;
  }
  // From here on, matching state only clears the way for the own-key comparison
  if (tag === ARRAY_BUFFER_TAG)
    return equalsBytes(
      new Uint8Array(left as ArrayBuffer),
      new Uint8Array(right as ArrayBuffer),
    )
      ? undefined
      : false;
  if (tag === DATA_VIEW_TAG)
    return equalsBytes(viewBytes(left), viewBytes(right)) ? undefined : false;
  if (tag === NUMBER_TAG) {
    const leftNumber = numberValueOf.call(left);
    const rightNumber = numberValueOf.call(right);
    return leftNumber === rightNumber ||
      (leftNumber !== leftNumber && rightNumber !== rightNumber)
      ? undefined
      : false;
  }
  if (tag === STRING_TAG)
    return stringValueOf.call(left) === stringValueOf.call(right)
      ? undefined
      : false;
  if (tag === BOOLEAN_TAG)
    return booleanValueOf.call(left) === booleanValueOf.call(right)
      ? undefined
      : false;
  if (tag === ERROR_TAG)
    return (left as Error).name === (right as Error).name &&
      (left as Error).message === (right as Error).message
      ? undefined
      : false;
  return undefined;
};

const numberValueOf = Number.prototype.valueOf;
const stringValueOf = String.prototype.valueOf;
const booleanValueOf = Boolean.prototype.valueOf;

/**
 * Reads the bytes a `DataView` covers, without copying them.
 *
 * @param view - A `DataView`, already known by its tag
 * @returns A byte view over the same range of the same buffer
 */
const viewBytes = (view: object): Uint8Array => {
  const { buffer, byteOffset, byteLength } = view as DataView;
  return new Uint8Array(buffer, byteOffset, byteLength);
};

/**
 * Compares two byte sequences element by element.
 *
 * @param left - First byte sequence
 * @param right - Second byte sequence
 * @returns Whether both have the same length and the same byte at every index
 */
const equalsBytes = (left: Uint8Array, right: Uint8Array): boolean => {
  const length = left.length;
  if (length !== right.length) return false;
  for (let i = 0; i < length; i++) if (left[i] !== right[i]) return false;
  return true;
};
