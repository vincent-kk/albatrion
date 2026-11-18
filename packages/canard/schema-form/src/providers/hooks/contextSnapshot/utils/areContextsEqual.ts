import { isPlainObject } from '@winglet/common-utils/filter';
import { equals } from '@winglet/common-utils/object';

/** Built-in internal-slot tags supported by the shared comparator. */
const COMPARABLE_TAGS: readonly string[] = [
  '[object Date]',
  '[object RegExp]',
  '[object Set]',
  '[object ArrayBuffer]',
  '[object Number]',
  '[object String]',
  '[object Boolean]',
  '[object Error]',
];

/** Whether content comparison can inspect this built-in state. */
const hasComparableSlots = (value: object, tag: string): boolean =>
  ArrayBuffer.isView(value) || COMPARABLE_TAGS.includes(tag);

/**
 * Compare context content while treating opaque instance state as reference-owned.
 * @param left - Previously published context or a nested value.
 * @param right - Candidate context; caller-owned values are never mutated.
 * @returns Whether no observable context input has changed; same-instance mutations remain opaque.
 */
export const areContextsEqual = (left: unknown, right: unknown): boolean => {
  if (left === right || (left !== left && right !== right)) return true;
  const pending: unknown[] = [left, right];
  while (pending.length) {
    right = pending.pop();
    left = pending.pop();
    if (left === right || (left !== left && right !== right)) continue;
    if (
      left === null ||
      right === null ||
      typeof left !== 'object' ||
      typeof right !== 'object'
    )
      return false;
    if (Array.isArray(left) || Array.isArray(right)) {
      if (
        !Array.isArray(left) ||
        !Array.isArray(right) ||
        left.length !== right.length
      )
        return false;
      for (let i = left.length - 1; i >= 0; i--)
        if (left[i] !== right[i]) pending.push(left[i], right[i]);
      continue;
    }
    if (
      (Object.getPrototypeOf(left) === Object.prototype &&
        Object.getPrototypeOf(right) === Object.prototype) ||
      (isPlainObject(left) && isPlainObject(right))
    ) {
      const keys = Object.keys(left);
      if (keys.length !== Object.keys(right).length) return false;
      for (const key of keys) {
        if (!Object.prototype.hasOwnProperty.call(right, key)) return false;
        const a = Reflect.get(left, key);
        const b = Reflect.get(right, key);
        if (a !== b) pending.push(a, b);
      }
      continue;
    }
    const tag = Object.prototype.toString.call(left);
    if (tag !== Object.prototype.toString.call(right)) return false;
    if (tag === '[object Map]') {
      if (Reflect.get(left, 'size') !== Reflect.get(right, 'size'))
        return false;
      for (const [key, value] of Map.prototype.entries.call(left)) {
        if (!Map.prototype.has.call(right, key)) return false;
        pending.push(value, Map.prototype.get.call(right, key));
      }
      continue;
    }
    if (!hasComparableSlots(left, tag) || !equals(left, right)) return false;
  }
  return true;
};
