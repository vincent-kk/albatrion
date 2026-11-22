import { isPlainObject } from '@/common-utils/utils/filter';

import { getCloneFrameKeys } from './getCloneFrameKeys';

/** One container and its suspended position while copying a child. */
type CloneFrame = {
  source: object;
  target: object;
  depth: number;
  keys: Generator<PropertyKey>;
  /** Whether target's chain is only `Object.prototype` or empty, so a key absent from it is assignable. */
  assignable: boolean;
};

/**
 * Continue in depth-first order with the recursive clone's existing cache.
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
  replicate: (
    value: unknown,
    limit: number | undefined,
    depth: number,
    cache: Map<object, unknown>,
  ) => unknown,
): object {
  const root = createFrame(source, depth, cache);
  const frames: CloneFrame[] = [root];
  while (frames.length) {
    const frame = frames[frames.length - 1];
    const next = frame.keys.next();
    if (next.done) {
      frames.pop();
      continue;
    }
    const key = next.value;
    const childDepth = frame.depth + 1;
    const value: unknown = Reflect.get(frame.source, key);
    let copy = value;
    if (
      (limit === undefined || !(childDepth >= limit)) &&
      value !== null &&
      typeof value === 'object' &&
      !((key === 'index' || key === 'input') && Array.isArray(frame.source))
    ) {
      if (cache.has(value)) copy = cache.get(value);
      else if (
        (Array.isArray(value) &&
          Object.getPrototypeOf(value) === Array.prototype) ||
        isPlainObject(value)
      ) {
        const child = createFrame(value, childDepth, cache);
        frames.push(child);
        copy = child.target;
      } else copy = replicate(value, limit, childDepth, cache);
    }
    // Assigning a key absent from an ordinary chain creates the same own data property.
    if (frame.assignable && !(key in frame.target))
      (frame.target as Record<PropertyKey, unknown>)[key] = copy;
    else
      Object.defineProperty(frame.target, key, {
        value: copy,
        writable: true,
        configurable: true,
        enumerable: true,
      });
  }
  return root.target;
}

/** Allocate and cache a shell before its first property is read. */
function createFrame(
  source: object,
  depth: number,
  cache: Map<object, unknown>,
): CloneFrame {
  const prototype = Array.isArray(source)
    ? undefined
    : Object.getPrototypeOf(source);
  const target: object =
    prototype === undefined
      ? new Array((source as unknown[]).length)
      : Object.create(prototype);
  cache.set(source, target);
  return {
    source,
    target,
    depth,
    keys: getCloneFrameKeys(source),
    assignable: prototype === OBJECT_PROTOTYPE || prototype === null,
  };
}

const OBJECT_PROTOTYPE = Object.prototype;
