import { isPlainObject } from '@/common-utils/utils/filter';

import { getCloneFrameKeys } from './getCloneFrameKeys';

/** One caller-owned source container and its clone at an absolute root depth. */
type CloneFrame = { source: object; target: object; depth: number };

/**
 * Continue a deep plain-container graph using the recursive clone's existing cache.
 * @param source Ordinary dictionary or intrinsic array where the recursive prefix stops.
 * @param limit Maximum depth from the original root; boundary values remain shared.
 * @param depth Absolute depth of source, before visiting its children.
 * @param cache Identity cache shared with the already cloned prefix.
 * @param replicate Existing type-specific copier for non-plain leaves.
 * @returns A prototype-preserving clone with cycles linked to the same cache.
 */
export function replicateDeep(
  source: object,
  limit: number | undefined,
  depth: number,
  cache: Map<object, unknown>,
  replicate: (value: unknown, limit: number | undefined, depth: number, cache: Map<object, unknown>) => unknown,
): object {
  const target: object = Array.isArray(source) ? new Array(source.length) : Object.create(Object.getPrototypeOf(source));
  cache.set(source, target);
  const frames: CloneFrame[] = [{ source, target, depth }];
  while (frames.length) {
    const frame = frames.pop()!;
    const childDepth = frame.depth + 1;
    for (const key of getCloneFrameKeys(frame.source)) {
      const value: unknown = Reflect.get(frame.source, key);
      let copy = value;
      if ((limit === undefined || childDepth < limit) && value !== null && typeof value === 'object') {
        if (cache.has(value)) copy = cache.get(value);
        else if ((Array.isArray(value) && Object.getPrototypeOf(value) === Array.prototype) || isPlainObject(value)) {
          const child: object = Array.isArray(value) ? new Array(value.length) : Object.create(Object.getPrototypeOf(value));
          cache.set(value, child);
          frames.push({ source: value, target: child, depth: childDepth });
          copy = child;
        } else copy = replicate(value, limit, childDepth, cache);
      }
      Object.defineProperty(frame.target, key, { value: copy, writable: true, configurable: true, enumerable: true });
    }
  }
  return target;
}
