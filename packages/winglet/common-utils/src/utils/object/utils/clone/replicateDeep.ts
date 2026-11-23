import { isPlainObject } from '@/common-utils/utils/filter';

import { getSymbols } from '../../getSymbols';
import { getCloneFrameKeys } from './getCloneFrameKeys';

/** One container and its suspended position while copying a child. */
type CloneFrame = {
  source: object;
  target: object;
  depth: number;
  /** Array key iterator, or null for a dictionary that walks `names`. */
  keys: Generator<PropertyKey> | null;
  /** Dictionary string keys, then its enumerable symbols; listed when first needed. */
  names: PropertyKey[] | null;
  /** Index of the next entry of `names`. */
  position: number;
  /** Whether `names` already holds the symbols. */
  symbols: boolean;
  /** Whether target is an ordinary object; an array target never becomes one, so this stays true to its creation. */
  dictionary: boolean;
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
    let key: PropertyKey;
    if (frame.keys !== null) {
      const next = frame.keys.next();
      if (next.done) {
        frames.pop();
        continue;
      }
      key = next.value;
    } else {
      let names = frame.names;
      if (names === null) {
        // Checked before listing keys so a proxy revoked meanwhile fails on IsArray first.
        Array.isArray(frame.source);
        names = frame.names = Object.keys(frame.source);
        // A replaced Object.keys may return a non-array whose length never ends the walk.
        if (!isArray(names)) names = frame.names = Array.from(names);
      }
      if (frame.position >= names.length) {
        if (frame.symbols) {
          frames.pop();
          continue;
        }
        names = frame.names = getSymbols(frame.source);
        frame.position = 0;
        frame.symbols = true;
        if (names.length === 0) {
          frames.pop();
          continue;
        }
      }
      key = names[frame.position++];
    }
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
    // User code may change the target mid-call, so its live state decides: on an extensible
    // ordinary object whose chain is Object.prototype or empty and lacks the key, assigning
    // creates the same own data property that defineProperty would, with no trap or setter.
    const chain = frame.dictionary ? getPrototypeOf(frame.target) : undefined;
    if (
      (chain === OBJECT_PROTOTYPE || chain === null) &&
      isExtensible(frame.target) &&
      !(key in frame.target)
    )
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
  if (Array.isArray(source)) {
    const target: object = new Array(source.length);
    cache.set(source, target);
    return {
      source,
      target,
      depth,
      keys: getCloneFrameKeys(source),
      names: null,
      position: 0,
      symbols: false,
      dictionary: false,
    };
  }
  const prototype = Object.getPrototypeOf(source);
  const target: object = Object.create(prototype);
  cache.set(source, target);
  return {
    source,
    target,
    depth,
    keys: null,
    names: null,
    position: 0,
    symbols: false,
    dictionary: true,
  };
}

const OBJECT_PROTOTYPE = Object.prototype;
const { getPrototypeOf, isExtensible } = Object;
const { isArray } = Array;
