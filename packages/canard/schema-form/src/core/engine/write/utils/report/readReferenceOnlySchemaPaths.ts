import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import {
  JSONPointer as $,
  appendSegment,
} from '@/schema-form/helpers/jsonPointer';

/** Shared frozen result when no reference-only change is found. */
const NO_PATHS: readonly string[] = Object.freeze([]);

/**
 * Find changed opaque references only when all JSON schema data is equal.
 * @param previous - Authored schema of the replaced root
 * @param next - Authored schema of the newly built root
 * @returns Changed schema pointers, or empty when JSON data also differs
 */

export const readReferenceOnlySchemaPaths = (
  previous: unknown,
  next: unknown,
): readonly string[] => {
  const pending: { previous: unknown; next: unknown; path: string }[] = [
    { previous, next, path: $.Fragment },
  ];
  const paths: string[] = [];
  const seen = new Map<object, Set<object>>();
  while (pending.length) {
    const item = pending.pop();
    if (!item || Object.is(item.previous, item.next)) continue;
    const left = item.previous;
    const right = item.next;
    if (typeof left !== typeof right || left === null || right === null)
      return NO_PATHS;
    if (
      typeof left === 'function' ||
      typeof left === 'symbol' ||
      typeof left === 'bigint'
    ) {
      paths.push(item.path);
      continue;
    }
    if (typeof left !== 'object' || typeof right !== 'object') return NO_PATHS;
    const leftArray = isArray(left);
    if (leftArray !== isArray(right)) return NO_PATHS;
    if (!leftArray) {
      const leftPrototype = Object.getPrototypeOf(left);
      const rightPrototype = Object.getPrototypeOf(right);
      if (leftPrototype !== rightPrototype) return NO_PATHS;
      if (leftPrototype !== Object.prototype && leftPrototype !== null) {
        paths.push(item.path);
        continue;
      }
    }
    if (seen.get(left)?.has(right)) continue;
    const seenRight = seen.get(left) ?? new Set<object>();
    seenRight.add(right);
    seen.set(left, seenRight);
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    let matchesEither = leftKeys.length !== rightKeys.length;
    if (!matchesEither) {
      matchesEither = false;
      for (let index = 0, count = leftKeys.length; index < count; index++) {
        const key = leftKeys[index];

        if (!hasOwnProperty(right, key)) {
          matchesEither = true;
          break;
        }
      }
    }
    if (matchesEither) {
      return NO_PATHS;
    }
    for (let index = leftKeys.length - 1; index >= 0; index -= 1) {
      const key = leftKeys[index];
      pending.push({
        previous: Reflect.get(left, key),
        next: Reflect.get(right, key),
        path: appendSegment(item.path, key),
      });
    }
  }
  return paths;
};
