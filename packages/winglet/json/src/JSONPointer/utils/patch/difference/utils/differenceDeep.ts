import { isPlainObject } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { cloneLite, equals, setDataProperty } from '@winglet/common-utils/object';
import type { JSONObject } from '@/json/type';

/** Suspended object comparison, completed only after every child comparison. */
type DifferenceFrame = {
  /** Original own-data source. */
  source: JSONObject;
  /** Desired own-data target. */
  target: JSONObject;
  /** Source keys captured before descending into children. */
  keys: string[];
  /** Next source key to compare. */
  index: number;
  /** Lazily created merge patch. */
  patch: JSONObject | undefined;
  /** Whether a source key is removed. */
  hasRemoved: boolean;
  /** Receives the completed patch in its parent. */
  write: (patch: JSONObject | undefined) => void;
};

/**
 * Computes a plain-object merge difference using explicit depth-first frames.
 * @param source - Existing plain-object node
 * @param target - Desired plain-object node
 * @returns A merge patch, or undefined when no observable member changes
 */
export const differenceDeep = (source: JSONObject, target: JSONObject): JSONObject | undefined => {
  let result: JSONObject | undefined;
  const pending = [createFrame(source, target, patch => { result = patch; })];
  while (pending.length) {
    const frame = pending[pending.length - 1];
    if (frame.index < frame.keys.length) {
      const key = frame.keys[frame.index++];
      const sourceValue = frame.source[key];
      if (!hasOwnProperty(frame.target, key) || frame.target[key] === undefined) {
        if (hasOwnProperty(frame.target, key) && sourceValue === undefined) continue;
        setDataProperty(frame.patch ??= {}, key, null);
        frame.hasRemoved = true;
        continue;
      }
      const targetValue = frame.target[key];
      if (sourceValue === targetValue || (sourceValue !== sourceValue && targetValue !== targetValue)) continue;
      if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
        pending.push(createFrame(sourceValue, targetValue, child => {
          if (child !== undefined) setDataProperty(frame.patch ??= {}, key, child);
        }));
      } else if (!equals(sourceValue, targetValue)) setDataProperty(frame.patch ??= {}, key, cloneLite(targetValue));
      continue;
    }
    const targetKeys = Object.keys(frame.target);
    if (frame.hasRemoved || targetKeys.length !== frame.keys.length) {
      for (const key of targetKeys) {
        const value = frame.target[key];
        if (!hasOwnProperty(frame.source, key) && value !== undefined) setDataProperty(frame.patch ??= {}, key, cloneLite(value));
      }
    }
    pending.pop();
    frame.write(frame.patch);
  }
  return result;
};

/**
 * Captures one suspended comparison without allocating a patch prematurely.
 * @param source - Existing node
 * @param target - Desired node
 * @param write - Parent completion sink
 * @returns An unstarted comparison frame
 */
const createFrame = (source: JSONObject, target: JSONObject, write: DifferenceFrame['write']): DifferenceFrame => ({
  source, target, keys: Object.keys(source), index: 0, patch: undefined, hasRemoved: false, write,
});
