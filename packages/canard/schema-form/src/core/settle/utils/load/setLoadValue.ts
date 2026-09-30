import { unescapeSegment } from '@winglet/json/pointer';
import { sameValue } from '../compute/sameValue';
import { getLoadValue } from './getLoadValue';

/**
 * Replace one snapshot path by copying only the ancestors above it.
 * @param snapshot - Previous form load source
 * @param path - Absolute JSON Pointer of the new load
 * @param value - Caller-owned immutable load value
 * @returns New root snapshot retaining all unrelated references
 */
export const setLoadValue = (snapshot: unknown, path: string, value: unknown): unknown => {
  if (sameValue(getLoadValue(snapshot, path), value)) return snapshot;
  if (!path) return value;
  const segments = path.slice(1).split('/').map(unescapeSegment);
  const ancestors: unknown[] = [snapshot];
  let source = snapshot;
  for (const segment of segments) {
    source = source !== null && typeof source === 'object'
      ? Reflect.get(source, segment) : undefined;
    ancestors.push(source);
  }
  let next = value;
  for (let index = segments.length - 1; index >= 0; index--) {
    const parent = ancestors[index];
    const copy = Array.isArray(parent) ? [...parent] :
      parent !== null && typeof parent === 'object' ? { ...parent } : {};
    Reflect.set(copy, segments[index], next);
    next = copy;
  }
  return next;
};
