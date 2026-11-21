import { isPlainObject } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import {
  cloneLite,
  equals,
  setDataProperty,
} from '@winglet/common-utils/object';

import type { JSONObject } from '@/json/type';

import { differenceDeep } from './differenceDeep';

/**
 * Builds the merge patch for two corresponding plain-object nodes.
 *
 * Reserved names are compared as own data and written through the shared safe-property
 * primitive, so applying the resulting patch reconstructs these members as well.
 *
 * @param source - The source node to compare
 * @param target - The target node to compare
 * @returns The lazily allocated patch node, or `undefined` when the nodes are equal
 *
 * @internal This function is for internal use by the differenceObjectPatch function
 */
export const differenceRecursive = (
  source: JSONObject,
  target: JSONObject,
  depth = 0,
): JSONObject | undefined => {
  if (depth === 256) return differenceDeep(source, target);
  let patch: JSONObject | undefined = undefined;
  let hasRemoved = false;
  const sourceKeys = Object.keys(source);
  for (let i = 0, l = sourceKeys.length; i < l; i++) {
    const key = sourceKeys[i];
    const reserved =
      key === '__proto__' || key === 'constructor' || key === 'prototype';
    const sourceValue = source[key];
    if (hasOwnProperty(target, key)) {
      const targetValue = target[key];
      if (
        sourceValue === targetValue ||
        (sourceValue !== sourceValue && targetValue !== targetValue)
      )
        continue;
      if (targetValue === undefined) {
        if (reserved) setDataProperty((patch ??= {}), key, null);
        else (patch ??= {})[key] = null;
        hasRemoved = true;
      } else if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
        const child = differenceRecursive(sourceValue, targetValue, depth + 1);
        if (child !== undefined) {
          if (reserved) setDataProperty((patch ??= {}), key, child);
          else (patch ??= {})[key] = child;
        }
      } else if (!equals(sourceValue, targetValue)) {
        if (reserved)
          setDataProperty((patch ??= {}), key, cloneLite(targetValue));
        else (patch ??= {})[key] = cloneLite(targetValue);
      }
    } else {
      if (reserved) setDataProperty((patch ??= {}), key, null);
      else (patch ??= {})[key] = null;
      hasRemoved = true;
    }
  }
  const targetKeys = Object.keys(target);
  if (!hasRemoved && targetKeys.length === sourceKeys.length) return patch;
  for (let i = 0, l = targetKeys.length; i < l; i++) {
    const key = targetKeys[i];
    const targetValue = target[key];
    if (hasOwnProperty(source, key) || targetValue === undefined) continue;
    if (key === '__proto__' || key === 'constructor' || key === 'prototype')
      setDataProperty((patch ??= {}), key, cloneLite(targetValue));
    else (patch ??= {})[key] = cloneLite(targetValue);
  }
  return patch;
};
