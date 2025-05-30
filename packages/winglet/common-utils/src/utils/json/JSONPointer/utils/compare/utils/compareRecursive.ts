import type { Dictionary } from '@aileron/declare';

import { getKeys } from '@/common-utils/libs/getKeys';
import { hasOwnProperty } from '@/common-utils/libs/hasOwnProperty';
import { isArray } from '@/common-utils/utils/filter/isArray';
import { isObject } from '@/common-utils/utils/filter/isObject';

import { JSONPointer } from '../../../enum';
import { escapePointer } from '../../escape/escapePointer';
import { type Fetch, Operation } from '../type';
import { cloneObject } from './cloneObject';

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
 *
 * @internal This function is for internal use by the compare function
 */
export const compareRecursive = <
  Source extends Dictionary | Array<any>,
  Target extends Dictionary | Array<any>,
>(
  source: Source,
  target: Target,
  fetches: Fetch[],
  path: string = '',
) => {
  // @ts-expect-error: when target and source are same reference, it should return immediately
  if (target === source) return;

  if ('toJson' in source && typeof source.toJson === 'function')
    source = source.toJson();

  if ('toJson' in target && typeof target.toJson === 'function')
    target = target.toJson();

  const sourceKeys = getKeys(source);
  const targetKeys = getKeys(target);

  // Cache type checks for performance
  const sourceIsArray = isArray(source);
  const targetIsArray = isArray(target);

  let hasRemoved = false;

  // Reverse iteration to maintain BFS key order
  for (let i = sourceKeys.length - 1; i >= 0; i--) {
    const key = sourceKeys[i];
    const sourceValue = source[key as keyof Source];

    // Check if key exists in target (optimized)
    if (hasOwnProperty(target, key)) {
      const targetValue = target[key];

      // Fast path: identical values
      if (sourceValue === targetValue) continue;

      // Handle undefined values in non-array contexts
      if (
        targetValue === undefined &&
        sourceValue !== undefined &&
        !targetIsArray
      ) {
        fetches.push({
          operation: Operation.REMOVE,
          path: path + JSONPointer.Child + escapePointer(key),
        });
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
          fetches,
          path + JSONPointer.Child + escapePointer(key),
        );
      } else {
        // Value replacement - most common case (no type checks needed)
        fetches.push({
          operation: Operation.REPLACE,
          path: path + JSONPointer.Child + escapePointer(key),
          value: cloneObject(targetValue),
        });
      }
    } else if (sourceIsArray === targetIsArray) {
      // Key removal for compatible types
      fetches.push({
        operation: Operation.REMOVE,
        path: path + JSONPointer.Child + escapePointer(key),
      });
      hasRemoved = true;
    } else {
      // Type mismatch - replace entire structure
      fetches.push({
        operation: Operation.REPLACE,
        path: path,
        value: target,
      });
    }
  }

  // Early exit optimization
  if (!hasRemoved && targetKeys.length === sourceKeys.length) return;

  // Process additions (new keys in target)
  for (let i = 0; i < targetKeys.length; i++) {
    const key = targetKeys[i];
    const targetValue = target[key as keyof Target];

    // Skip if key exists in source or value is undefined
    if (hasOwnProperty(source, key) || targetValue === undefined) continue;

    fetches.push({
      operation: Operation.ADD,
      path: path + JSONPointer.Child + escapePointer(key),
      value: cloneObject(targetValue),
    });
  }
};
