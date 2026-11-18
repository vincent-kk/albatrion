import { isPlainObject } from '@winglet/common-utils/filter';
import {
  deleteDataProperty,
  getDataProperty,
  isReservedName,
  setDataProperty,
} from '@winglet/common-utils/object';

import type { JSONObject } from '@/json/type';

/** Suspended merge retaining the original completion-write order. */
type MergeFrame = {
  /** Owned target being updated. */
  source: JSONObject;
  /** Plain-object merge patch. */
  patch: JSONObject;
  /** Own patch keys in their traversal order. */
  keys: string[];
  /** Next patch key to process. */
  index: number;
  /** Writes the completed child back into its parent. */
  complete?: () => void;
};

/**
 * Applies a plain-object merge patch without recursive calls.
 * @param source - Owned plain-object target
 * @param patch - Plain-object patch whose null members remove target members
 * @returns The updated target, preserving reserved-name own-data semantics
 */
export const mergePatchDeep = (
  source: JSONObject,
  patch: JSONObject,
): JSONObject => {
  const pending: MergeFrame[] = [
    { source, patch, keys: Object.keys(patch), index: 0 },
  ];
  while (pending.length) {
    const frame = pending[pending.length - 1];
    if (frame.index === frame.keys.length) {
      pending.pop();
      frame.complete?.();
      continue;
    }
    const key = frame.keys[frame.index++];
    const value = frame.patch[key];
    const reserved = isReservedName(key);
    if (value === null) {
      if (reserved) deleteDataProperty(frame.source, key);
      else delete frame.source[key];
    } else if (isPlainObject(value)) {
      const current = reserved
        ? getDataProperty(frame.source, key)
        : frame.source[key];
      const child: JSONObject = isPlainObject(current) ? current : {};
      pending.push({
        source: child,
        patch: value,
        keys: Object.keys(value),
        index: 0,
        complete: () => {
          if (reserved) setDataProperty(frame.source, key, child);
          else frame.source[key] = child;
        },
      });
    } else {
      const current = reserved
        ? getDataProperty(frame.source, key)
        : frame.source[key];
      const merged =
        value === undefined ? (current === undefined ? {} : current) : value;
      if (reserved) setDataProperty(frame.source, key, merged);
      else frame.source[key] = merged;
    }
  }
  return source;
};
