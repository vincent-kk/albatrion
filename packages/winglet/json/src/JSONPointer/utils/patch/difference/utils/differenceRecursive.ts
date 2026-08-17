import { isPlainObject } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { cloneLite, equals } from '@winglet/common-utils/object';

import {
  CONSTRUCTOR_KEY,
  PROTOTYPE_ASSESS_KEY,
  PROTOTYPE_KEY,
} from '@/json/JSONPointer/constants/prototypeKey';
import type { JsonObject } from '@/json/type';

/**
 * Builds the merge patch for two corresponding plain-object nodes.
 *
 * Prototype-polluting keys (`__proto__`, `constructor`, `prototype`) are skipped on both
 * sides; a skip also disables the equal-key-count early exit, whose reasoning assumes
 * every source key was actually compared.
 *
 * @param source - The source node to compare
 * @param target - The target node to compare
 * @returns The lazily allocated patch node, or `undefined` when the nodes are equal
 *
 * @internal This function is for internal use by the differenceObjectPatch function
 */
export const differenceRecursive = (
  source: JsonObject,
  target: JsonObject,
): JsonObject | undefined => {
  let patch: JsonObject | undefined = undefined;
  let hasRemoved = false;
  let hasForbidden = false;
  const sourceKeys = Object.keys(source);
  for (let i = 0, l = sourceKeys.length; i < l; i++) {
    const key = sourceKeys[i];
    // Skipped, not just sanitized: assigning '__proto__' on the patch literal would
    // swap its prototype instead of defining a key
    if (
      key === PROTOTYPE_KEY ||
      key === CONSTRUCTOR_KEY ||
      key === PROTOTYPE_ASSESS_KEY
    ) {
      hasForbidden = true;
      continue;
    }
    const sourceValue = source[key];
    if (hasOwnProperty(target, key)) {
      const targetValue = target[key];
      if (
        sourceValue === targetValue ||
        (sourceValue !== sourceValue && targetValue !== targetValue)
      )
        continue;
      if (targetValue === undefined) {
        (patch ??= {})[key] = null;
        hasRemoved = true;
      } else if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
        const child = differenceRecursive(sourceValue, targetValue);
        if (child !== undefined) (patch ??= {})[key] = child;
      } else if (!equals(sourceValue, targetValue))
        (patch ??= {})[key] = cloneLite(targetValue);
    } else {
      (patch ??= {})[key] = null;
      hasRemoved = true;
    }
  }
  const targetKeys = Object.keys(target);
  if (!hasRemoved && !hasForbidden && targetKeys.length === sourceKeys.length)
    return patch;
  for (let i = 0, l = targetKeys.length; i < l; i++) {
    const key = targetKeys[i];
    if (
      key === PROTOTYPE_KEY ||
      key === CONSTRUCTOR_KEY ||
      key === PROTOTYPE_ASSESS_KEY
    )
      continue;
    const targetValue = target[key];
    if (hasOwnProperty(source, key) || targetValue === undefined) continue;
    (patch ??= {})[key] = cloneLite(targetValue);
  }
  return patch;
};
