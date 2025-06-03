import {
  getKeys,
  hasOwnProperty,
  isArray,
  isObject,
} from '@winglet/common-utils';

import { JSONPointer } from '@/json/JSONPointer/enum';
import { escapePointer } from '@/json/JSONPointer/utils/escape/escapePointer';
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

  if ('toJson' in source && typeof source.toJson === 'function')
    source = source.toJson();

  if ('toJson' in target && typeof target.toJson === 'function')
    target = target.toJson();

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

  // Process existing keys in source
  for (let i = 0; i < sourceKeys.length; i++) {
    const key = sourceKeys[i];
    const sourceValue = source[key as keyof Source];

    // Check if key exists in target (optimized)
    if (hasOwnProperty(target, key)) {
      const targetValue = target[key];

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
        const targetPath = path + JSONPointer.Child + escapePointer(key);
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
          path + JSONPointer.Child + escapePointer(key),
          strict,
          immutable,
        );
      } else {
        // Value type change - replace the value
        const targetPath = path + JSONPointer.Child + escapePointer(key);
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
      const targetPath = path + JSONPointer.Child + escapePointer(key);
      if (strict)
        patches.push({
          op: Operation.TEST,
          path: targetPath,
          value: processValue(sourceValue, immutable),
        });
      patches.push({ op: Operation.REMOVE, path: targetPath });
      hasRemoved = true;
    }
  }

  // Early exit optimization - no additions needed
  if (!hasRemoved && targetKeys.length === sourceKeys.length) return;

  // Process additions (new keys in target)
  for (let i = 0; i < targetKeys.length; i++) {
    const key = targetKeys[i];
    const targetValue = target[key as keyof Target];

    // Skip if key exists in source or value is undefined
    if (hasOwnProperty(source, key) || targetValue === undefined) continue;

    patches.push({
      op: Operation.ADD,
      path: path + JSONPointer.Child + escapePointer(key),
      value: processValue(targetValue, immutable),
    });
  }
};
