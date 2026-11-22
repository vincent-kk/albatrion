import { isPlainObject } from '@/common-utils/utils/filter';

import { countRetainedKeys } from '../countRetainedKeys';

/**
 * Compare deep plain-container graphs without recursive frames.
 * @param left Left operand at the recursive prefix boundary.
 * @param right Right operand at that boundary.
 * @param visited Pair identities shared with the recursive prefix.
 * @param omits Object keys excluded at every depth; array indices retain their existing rule.
 * @param compare Existing type-specific comparison for non-plain leaves.
 * @returns Whether all retained values, array holes and cycle pairs match.
 */
export function stableEqualsDeep(
  left: unknown,
  right: unknown,
  visited: Map<object, Set<object>>,
  omits: Set<PropertyKey> | null,
  compare: (left: unknown, right: unknown, visited: Map<object, Set<object>>, omits: Set<PropertyKey> | null) => boolean,
): boolean {
  const frames: Array<[unknown, unknown]> = [[left, right]];
  while (frames.length) {
    const [first, second] = frames.pop()!;
    if (first === second || (first !== first && second !== second)) continue;
    if (first === null || second === null || typeof first !== 'object' || typeof second !== 'object') return false;
    const firstArray = Array.isArray(first), secondArray = Array.isArray(second);
    if (firstArray !== secondArray) return false;
    if ((!firstArray && (!isPlainObject(first) || !isPlainObject(second))) || Symbol.toStringTag in first || Symbol.toStringTag in second) {
      if (!compare(first, second, visited, omits)) return false;
      continue;
    }
    let seen = visited.get(first);
    if (seen?.has(second)) continue;
    if (!seen) visited.set(first, (seen = new Set()));
    seen.add(second);
    let reverse = visited.get(second);
    if (!reverse) visited.set(second, (reverse = new Set()));
    reverse.add(first);
    if (firstArray && secondArray) {
      if (first.length !== second.length) return false;
      for (let index = 0; index < first.length; index++) {
        if ((index in first) !== (index in second)) return false;
        if (index in first) frames.push([first[index], second[index]]);
      }
    } else {
      const firstKeys = Reflect.ownKeys(first), secondKeys = Reflect.ownKeys(second);
      if ((omits ? countRetainedKeys(firstKeys, omits) : firstKeys.length) !== (omits ? countRetainedKeys(secondKeys, omits) : secondKeys.length)) return false;
      for (const key of firstKeys) {
        if (omits?.has(key)) continue;
        if (!Object.prototype.hasOwnProperty.call(second, key)) return false;
        frames.push([Reflect.get(first, key), Reflect.get(second, key)]);
      }
    }
  }
  return true;
}
