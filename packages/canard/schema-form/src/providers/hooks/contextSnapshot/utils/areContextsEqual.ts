import { isPlainObject } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { equals } from '@winglet/common-utils/object';

/** Tags delegated directly to the shared comparator. */
const COMPARABLE_TAGS: readonly string[] = [
  '[object Date]',
  '[object RegExp]',
  '[object Set]',
];

/** Own non-enumerable error state: the ES2022 `cause` and AggregateError `errors`. */
const ERROR_SLOTS: readonly string[] = ['cause', 'errors'];

/**
 * Compare context content while treating opaque instance state as reference-owned.
 * @param left - Previously published context or a nested value.
 * @param right - Candidate context; caller-owned values are never mutated.
 * @returns Whether no observable context input has changed; same-instance mutations remain opaque.
 */
export const areContextsEqual = (left: unknown, right: unknown): boolean => {
  if (left === right || (left !== left && right !== right)) return true;
  const pending: unknown[] = [left, right];
  const pairs: object[] = [];
  let pairIndex: Map<object, Set<object>> | undefined;
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
    if (pairIndex) {
      const rights = pairIndex.get(left);
      if (rights?.has(right)) continue;
      if (rights) rights.add(right);
      else pairIndex.set(left, new Set([right]));
    } else {
      let isVisited = false;
      for (let index = pairs.length - 2; index >= 0; index -= 2)
        if (pairs[index] === left && pairs[index + 1] === right) {
          isVisited = true;
          break;
        }
      if (isVisited) continue;
      pairs.push(left, right);
      if (pairs.length === 64) {
        pairIndex = new Map();
        for (let index = 0; index < pairs.length; index += 2) {
          const a = pairs[index];
          const b = pairs[index + 1];
          const rights = pairIndex.get(a);
          if (rights) rights.add(b);
          else pairIndex.set(a, new Set([b]));
        }
      }
    }
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
    const prototype = Object.getPrototypeOf(left);
    if (
      (prototype === Object.prototype &&
        Object.getPrototypeOf(right) === Object.prototype) ||
      (prototype !== Map.prototype &&
        isPlainObject(left) &&
        isPlainObject(right))
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
    const isErrorTag = tag === '[object Error]';
    if (
      isErrorTag ||
      tag === '[object ArrayBuffer]' ||
      tag === '[object Number]' ||
      tag === '[object String]' ||
      tag === '[object Boolean]' ||
      ArrayBuffer.isView(left)
    ) {
      const keys = Object.keys(left);
      if (keys.length !== Object.keys(right).length) return false;
      if (isErrorTag) {
        if (
          Reflect.get(left, 'name') !== Reflect.get(right, 'name') ||
          Reflect.get(left, 'message') !== Reflect.get(right, 'message')
        )
          return false;
        for (const slot of ERROR_SLOTS) {
          const has = hasOwnProperty(left, slot);
          if (has !== hasOwnProperty(right, slot)) return false;
          if (has) {
            const a = Reflect.get(left, slot);
            const b = Reflect.get(right, slot);
            if (a !== b) pending.push(a, b);
          }
        }
      } else if (tag === '[object Number]') {
        const a = Number.prototype.valueOf.call(left),
          b = Number.prototype.valueOf.call(right);
        if (a !== b && (a === a || b === b)) return false;
      } else if (tag === '[object String]') {
        if (
          String.prototype.valueOf.call(left) !==
          String.prototype.valueOf.call(right)
        )
          return false;
      } else if (tag === '[object Boolean]') {
        if (
          Boolean.prototype.valueOf.call(left) !==
          Boolean.prototype.valueOf.call(right)
        )
          return false;
      } else if (!equals(left, right, keys)) return false;
      for (const key of keys) {
        if (!Object.prototype.hasOwnProperty.call(right, key)) return false;
        const a = Reflect.get(left, key);
        const b = Reflect.get(right, key);
        if (a !== b) pending.push(a, b);
      }
      continue;
    }
    if (!COMPARABLE_TAGS.includes(tag) || !equals(left, right)) return false;
  }
  return true;
};
