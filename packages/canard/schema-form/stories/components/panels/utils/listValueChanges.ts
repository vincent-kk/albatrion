import { isArray, isPlainObject } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

/** One leaf-level difference between two form values, addressed by JSON Pointer. */
export interface ValueChange {
  /** JSON Pointer of the difference; the empty pointer is the whole value. */
  readonly path: string;
  /** Whether the location exists only after, only before, or in both with different content. */
  readonly kind: 'added' | 'removed' | 'changed';
  /** Value before the change; absent for an added location. */
  readonly before?: unknown;
  /** Value after the change; absent for a removed location. */
  readonly after?: unknown;
}

/** Differences kept for display together with the number found. */
export interface ValueChanges {
  /** At most `limit` differences, ordered as the current value lists its keys. */
  readonly changes: readonly ValueChange[];
  /** Every difference found, including those beyond `limit`. */
  readonly total: number;
}

/** Marks a location that one side does not have, unlike a present `undefined`. */
const ABSENT = Symbol('absent');

/**
 * Read one child location of a container pair, keeping missing and undefined apart.
 * @param container - An array or plain object.
 * @param key - Array index or own property name.
 * @returns The child value, or ABSENT when the container has no such location.
 */
function readChild(container: unknown, key: string): unknown {
  if (isArray(container)) return Number(key) < container.length ? container[Number(key)] : ABSENT;
  return hasOwnProperty(container, key) ? (container as Record<string, unknown>)[key] : ABSENT;
}

/**
 * List where a form value differs from a baseline, descending through arrays and plain objects.
 * Other objects (File, Date) compare by identity; walking costs one visit per location in either value.
 * @param before - Baseline value, such as the defaultValue prop.
 * @param after - Current form value.
 * @param limit - Maximum number of differences to keep; later ones are only counted.
 * @returns Differences in the current value's key order, then keys only the baseline has; a
 * container replaced by a primitive or by the other container kind is one `changed` entry at its own path.
 */
export function listValueChanges(before: unknown, after: unknown, limit = 20): ValueChanges {
  const changes: ValueChange[] = [];
  let total = 0;
  const stack: [string, unknown, unknown][] = [['', before, after]];
  while (stack.length) {
    const [path, left, right] = stack.pop()!;
    const bothArrays = isArray(left) && isArray(right);
    if (bothArrays || (isPlainObject(left) && isPlainObject(right))) {
      const keys = bothArrays
        ? Array.from({ length: Math.max(left.length, right.length) }, (_, index) => String(index))
        : [...new Set([...Object.keys(right as object), ...Object.keys(left as object)])];
      for (let index = keys.length - 1; index >= 0; index--) {
        const key = keys[index];
        stack.push([`${path}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`, readChild(left, key), readChild(right, key)]);
      }
    } else if (!Object.is(left, right) && total++ < limit) {
      if (left === ABSENT) changes.push({ path, kind: 'added', after: right });
      else if (right === ABSENT) changes.push({ path, kind: 'removed', before: left });
      else changes.push({ path, kind: 'changed', before: left, after: right });
    }
  }
  return { changes, total };
}
