import { isArray, isObject } from '@winglet/common-utils/filter';
import { getKeys, hasOwnProperty } from '@winglet/common-utils/lib';

import { JSONPointer } from '@/json/JSONPointer/enum';
import { escapeSegment } from '@/json/JSONPointer/utils/escape/escapeSegment';
import type { JsonRoot } from '@/json/type';

import { Operation, type Patch } from '../type';
import { processValue } from './utils/processValue';

/**
 * Recursively compares two objects/arrays and populates the fetches array with difference operations.
 *
 * This is the internal implementation that performs the actual deep comparison logic.
 * It handles:
 * - Early return for identical references
 * - Automatic serialization of objects with toJson() method
 * - Recursive comparison of nested objects/arrays
 * - Generation of appropriate operations based on property changes
 * - Proper JSON Pointer path construction for nested properties
 *
 * @template Source - The type of the source object/array
 * @template Target - The type of the target object/array
 *
 * @param source - The source object or array being compared
 * @param target - The target object or array being compared
 * @param fetches - The array to populate with difference operations (modified in-place)
 * @param path - The current JSON Pointer path (default: '') used for nested property paths
 * @param strict - Whether to use strict comparison
 * @param immutable - Whether to use immutable comparison
 *
 * @internal This function is for internal use by the compare function
 */
export const compareRecursive = <
  Source extends JsonRoot,
  Target extends JsonRoot,
>(
  source: Source,
  target: Target,
  patches: Patch[],
  path: string,
  strict: boolean,
  immutable: boolean,
) => {
  // @ts-expect-error: when target and source are same reference, it should return immediately
  if (source === target || (source !== source && target !== target)) return;

  // Values that serialize themselves — Date above all — expose no own keys, so a key
  // comparison would report every pair of them as identical
  const sourceJson = serializable(source);
  const targetJson = serializable(target);
  if (sourceJson !== source || targetJson !== target) {
    // A hook that yields an object keeps the structural walk — recursed rather than
    // reassigned so the generic parameters keep describing what was actually passed in.
    // A hook that yields a scalar — Date above all — leaves nothing to walk, so the
    // node is replaced whole instead of comparing two key-less values as identical
    if (isObject(sourceJson) && isObject(targetJson)) {
      compareRecursive(
        sourceJson,
        targetJson,
        patches,
        path,
        strict,
        immutable,
      );
      return;
    }
    if (sourceJson === targetJson) return;
    if (strict)
      patches.push({
        op: Operation.TEST,
        path,
        value: processValue(sourceJson, immutable),
      });
    patches.push({
      op: Operation.REPLACE,
      path,
      value: processValue(targetJson, immutable),
    });
    return;
  }

  const sourceKeys = getKeys(source);
  const targetKeys = getKeys(target);

  // Cache type checks for performance
  const sourceIsArray = isArray(source);
  const targetIsArray = isArray(target);

  // Early type mismatch detection - handle at current level
  if (sourceIsArray !== targetIsArray) {
    if (strict) {
      patches.push({ op: Operation.TEST, path, value: source });
    }
    patches.push({ op: Operation.REPLACE, path, value: target });
    return; // Early exit - no further processing needed
  }

  let hasRemoved = false;
  // Array removals are emitted last index first: applyPatch splices, so an ascending
  // order would make every later index point past the array it has already shrunk
  const deferredRemovals: Patch[][] = [];

  // Process existing keys in source
  for (let i = 0, l = sourceKeys.length; i < l; i++) {
    const key = sourceKeys[i];
    const sourceValue: unknown = source[key as keyof Source];

    // Check if key exists in target (optimized)
    if (hasOwnProperty(target, key)) {
      const targetValue: unknown = target[key];

      // Fast path: identical values
      if (
        sourceValue === targetValue ||
        (sourceValue !== sourceValue && targetValue !== targetValue)
      )
        continue;

      // Handle undefined values in non-array contexts (JSON standard compliance)
      if (
        targetValue === undefined &&
        sourceValue !== undefined &&
        !targetIsArray
      ) {
        const targetPath = path + JSONPointer.Separator + escapeSegment(key);
        if (strict) {
          patches.push({
            op: Operation.TEST,
            path: targetPath,
            value: processValue(sourceValue, immutable),
          });
        }
        patches.push({ op: Operation.REMOVE, path: targetPath });
        hasRemoved = true;
        continue;
      }

      // Unified recursive comparison for compatible nested structures
      if (
        (isObject(sourceValue) && isObject(targetValue)) ||
        (isArray(sourceValue) && isArray(targetValue))
      ) {
        compareRecursive(
          sourceValue,
          targetValue,
          patches,
          path + JSONPointer.Separator + escapeSegment(key),
          strict,
          immutable,
        );
      } else {
        // Value type change - replace the value
        const targetPath = path + JSONPointer.Separator + escapeSegment(key);
        if (strict)
          patches.push({
            op: Operation.TEST,
            path: targetPath,
            value: processValue(sourceValue, immutable),
          });
        patches.push({
          op: Operation.REPLACE,
          path: targetPath,
          value: processValue(targetValue, immutable),
        });
      }
    } else {
      // Key removal - exists in source but not in target
      const targetPath = path + JSONPointer.Separator + escapeSegment(key);
      const removal: Patch[] = [];
      if (strict)
        removal.push({
          op: Operation.TEST,
          path: targetPath,
          value: processValue(sourceValue, immutable),
        });
      removal.push({ op: Operation.REMOVE, path: targetPath });
      if (sourceIsArray) deferredRemovals[deferredRemovals.length] = removal;
      else for (let r = 0, rl = removal.length; r < rl; r++) patches.push(removal[r]);
      hasRemoved = true;
    }
  }

  for (let i = deferredRemovals.length - 1; i >= 0; i--) {
    const removal = deferredRemovals[i];
    for (let r = 0, rl = removal.length; r < rl; r++) patches.push(removal[r]);
  }

  // Early exit optimization - no additions needed
  if (!hasRemoved && targetKeys.length === sourceKeys.length) return;

  // Process additions (new keys in target)
  for (let i = 0, l = targetKeys.length; i < l; i++) {
    const key = targetKeys[i];
    const targetValue = target[key as keyof Target];

    // Skip if key exists in source or value is undefined
    if (hasOwnProperty(source, key) || targetValue === undefined) continue;

    patches.push({
      op: Operation.ADD,
      path: path + JSONPointer.Separator + escapeSegment(key),
      value: processValue(targetValue, immutable),
    });
  }
};

/**
 * Reduces a self-serializing value to the form its own hook produces.
 *
 * `toJSON` is the standard hook every built-in and most user classes implement;
 * `toJson` is kept as the alias this module accepted before.
 *
 * @param value - Value to reduce
 * @returns The hook's result, or the value itself when it has no hook
 */
const serializable = (value: any): any => {
  if (typeof value?.toJSON === 'function') return value.toJSON();
  if (typeof value?.toJson === 'function') return value.toJson();
  return value;
};
