import { isPlainObject } from '@/common-utils/utils/filter';

import { countRetainedKeys } from '../countRetainedKeys';

/**
 * Progress through one visited plain-container pair: two arrays read by position
 * (`keys` is `null`), or two objects read by the first one's own keys, with the next
 * position or key index to read.
 */
type Frame =
  | [first: unknown[], second: unknown[], keys: null, index: number]
  | [first: object, second: object, keys: (string | symbol)[], index: number];

/**
 * Compare deep plain-container graphs without recursive frames, front to back, ending at
 * the first mismatch so later values are never read.
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
  compare: (
    left: unknown,
    right: unknown,
    visited: Map<object, Set<object>>,
    omits: Set<PropertyKey> | null,
  ) => boolean,
): boolean {
  const frames: Frame[] = [];
  let nextFirst = left;
  let nextSecond = right;
  for (;;) {
    const first = nextFirst;
    const second = nextSecond;
    if (
      first === null ||
      second === null ||
      typeof first !== 'object' ||
      typeof second !== 'object'
    )
      return false;
    const firstArray = Array.isArray(first);
    const secondArray = Array.isArray(second);
    if (firstArray !== secondArray) return false;
    if (
      (!firstArray && (!isPlainObject(first) || !isPlainObject(second))) ||
      Symbol.toStringTag in first ||
      Symbol.toStringTag in second
    ) {
      if (!compare(first, second, visited, omits)) return false;
    } else {
      let seen = visited.get(first);
      if (!seen?.has(second)) {
        if (!seen) visited.set(first, (seen = new Set()));
        seen.add(second);
        let reverse = visited.get(second);
        if (!reverse) visited.set(second, (reverse = new Set()));
        reverse.add(first);
        if (firstArray && secondArray) {
          if (first.length !== second.length) return false;
          frames.push([first, second, null, 0]);
        } else {
          const firstKeys = Reflect.ownKeys(first);
          const secondKeys = Reflect.ownKeys(second);
          if (
            (omits ? countRetainedKeys(firstKeys, omits) : firstKeys.length) !==
            (omits ? countRetainedKeys(secondKeys, omits) : secondKeys.length)
          )
            return false;
          frames.push([first, second, firstKeys, 0]);
        }
      }
    }
    for (;;) {
      if (frames.length === 0) return true;
      const frame = frames[frames.length - 1];
      const index = frame[3];
      if (index === (frame[2] === null ? frame[0].length : frame[2].length)) {
        frames.pop();
        continue;
      }
      frame[3] = index + 1;
      if (frame[2] === null) {
        const hasIndex = index in frame[0];
        const secondHasIndex = index in frame[1];
        if (hasIndex !== secondHasIndex) return false;
        if (!hasIndex) continue;
        nextFirst = frame[0][index];
        nextSecond = frame[1][index];
      } else {
        const keys = frame[2];
        const key = keys[index];
        if (omits?.has(key)) continue;
        if (!Object.prototype.hasOwnProperty.call(frame[1], key)) return false;
        nextFirst = Reflect.get(frame[0], key);
        nextSecond = Reflect.get(frame[1], key);
      }
      if (
        nextFirst === nextSecond ||
        (nextFirst !== nextFirst && nextSecond !== nextSecond)
      )
        continue;
      break;
    }
  }
}
