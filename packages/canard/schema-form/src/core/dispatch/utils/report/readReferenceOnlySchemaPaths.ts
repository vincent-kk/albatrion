import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

/**
 * Find changed opaque references only when all JSON schema data is equal.
 * @param previous - Authored schema of the replaced root
 * @param next - Authored schema of the newly built root
 * @returns Changed schema pointers, or empty when JSON data also differs
 */
export const readReferenceOnlySchemaPaths = (
  previous: unknown, next: unknown,
): readonly string[] => {
  const pending = [{ previous, next, path: '#' }];
  const paths: string[] = [];
  const seen = new WeakMap<object, WeakSet<object>>();
  while (pending.length) {
    const item = pending.pop();
    if (!item || Object.is(item.previous, item.next)) continue;
    const left = item.previous;
    const right = item.next;
    if (typeof left !== typeof right || left === null || right === null)
      return [];
    if (typeof left === 'function' || typeof left === 'symbol' ||
      typeof left === 'bigint') {
      paths.push(item.path);
      continue;
    }
    if (typeof left !== 'object' || typeof right !== 'object') return [];
    const leftArray = isArray(left);
    if (leftArray !== isArray(right)) return [];
    if (!leftArray) {
      const leftPrototype = Object.getPrototypeOf(left);
      const rightPrototype = Object.getPrototypeOf(right);
      if (leftPrototype !== rightPrototype) return [];
      if (leftPrototype !== Object.prototype && leftPrototype !== null) {
        paths.push(item.path);
        continue;
      }
    }
    if (seen.get(left)?.has(right)) continue;
    const seenRight = seen.get(left) ?? new WeakSet<object>();
    seenRight.add(right);
    seen.set(left, seenRight);
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    if (leftKeys.length !== rightKeys.length ||
      leftKeys.some((key) => !hasOwnProperty(right, key))) return [];
    for (let index = leftKeys.length - 1; index >= 0; index -= 1) {
      const key = leftKeys[index];
      const escaped = key.replace(/~/g, '~0').replace(/\//g, '~1');
      pending.push({ previous: Reflect.get(left, key),
        next: Reflect.get(right, key), path: `${item.path}/${escaped}` });
    }
  }
  return paths;
};
