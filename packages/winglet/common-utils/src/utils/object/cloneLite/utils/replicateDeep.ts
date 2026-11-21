import { isArray } from '@/common-utils/utils/filter/isArray';
import { isPlainObject } from '@/common-utils/utils/filter/isPlainObject';

import { setDataProperty } from '../../setDataProperty';

/** Work item retaining the original depth and destination of one cloned value. */
type CloneFrame = {
  /** Reads the value when its turn in depth-first traversal begins. */
  read: () => unknown;
  /** Original-document depth used by maxDepth. */
  depth: number;
  /** Stores the copied value in its already-owned destination. */
  write: (value: unknown) => void;
};

/**
 * Clones supported containers without recursive calls and retains unsupported leaves.
 * @param value - Value at the current original-document depth
 * @param limit - Absolute exclusive cloning-depth boundary, or undefined for no limit
 * @param depth - Original-document depth of value
 * @returns A structurally equivalent value with supported containers copied
 */
export function replicateDeep<Type>(
  value: Type,
  limit: number | undefined,
  depth: number,
): Type;
export function replicateDeep(
  value: unknown,
  limit: number | undefined,
  depth: number,
): unknown {
  let result: unknown;
  const active = Number.isFinite(limit) ? null : new WeakSet<object>();
  const pending: (CloneFrame | (() => void))[] = [
    {
      read: () => value,
      depth,
      write: (value) => {
        result = value;
      },
    },
  ];
  while (pending.length) {
    const frame = pending.pop()!;
    if (typeof frame === 'function') {
      frame();
      continue;
    }
    const current = frame.read();
    if (limit !== undefined && frame.depth >= limit) {
      frame.write(current);
      continue;
    }
    const isArrayValue = isArray(current);
    if (!isArrayValue && !isPlainObject(current)) {
      frame.write(current);
      continue;
    }
    if (active) {
      if (active.has(current))
        throw new RangeError('cloneLite input contains a cycle');
      active.add(current);
      pending.push(() => {
        active.delete(current);
      });
    }
    if (isArrayValue) {
      const output: unknown[] = new Array(current.length);
      frame.write(output);
      for (let index = current.length - 1; index >= 0; index--) {
        if (index in current)
          pending.push({
            read: () => current[index],
            depth: frame.depth + 1,
            write: (value) => {
              output[index] = value;
            },
          });
      }
    } else {
      const prototype = Object.getPrototypeOf(current);
      const output: Record<string, unknown> =
        prototype === Object.prototype ? {} : Object.create(prototype);
      frame.write(output);
      const keys = Object.keys(current);
      for (let index = keys.length - 1; index >= 0; index--) {
        const key = keys[index];
        pending.push({
          read: () => current[key],
          depth: frame.depth + 1,
          write: (value) => {
            setDataProperty(output, key, value);
          },
        });
      }
    }
  }
  return result;
}
