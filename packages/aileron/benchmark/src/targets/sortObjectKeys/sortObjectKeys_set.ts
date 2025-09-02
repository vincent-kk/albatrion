import type { Dictionary, Nullish } from '@aileron/declare';

import { hasOwnProperty } from '@/common-utils/libs';

/**
 * Sorts the keys of an object based on a predefined order.
 * Keys specified in the `keys` array appear first in the specified order,
 * followed by the remaining keys from the original object.
 *
 * @param object - The input object (can be null or undefined).
 * @param keys - An array of keys defining the desired initial order.
 * @param omitUndefined - If true, keys with undefined values are omitted.
 * @returns A new object with sorted keys, or an empty object if the input is nullish.
 */
export const sortObjectKeys = <Dict extends Dictionary>(
  object: Dict | Nullish,
  keys: string[],
  omitUndefined?: boolean,
): Dict => {
  // Input validation: Return empty object if input is nullish
  if (!object) {
    return {} as Dict;
  }

  const result: Dictionary = {};
  // Use Set for efficient lookup (O(1) average) of processed priority keys
  const processedPriorityKeys = new Set<string>();

  // First pass: Add priority keys in the specified order
  for (const key of keys) {
    // Check if the key exists in the object and meets the undefined condition
    if (hasOwnProperty(object, key)) {
      // Use Object.hasOwn for robustness
      const value = object[key];
      if (!omitUndefined || value !== undefined) {
        result[key] = value;
        processedPriorityKeys.add(key); // Mark this priority key as processed
      }
    }
  }

  // Second pass: Add remaining keys from the object
  for (const key in object) {
    // Ensure it's an own property and hasn't been processed already
    if (hasOwnProperty(object, key) && !processedPriorityKeys.has(key)) {
      const value = object[key];
      // Add if it meets the undefined condition
      if (!omitUndefined || value !== undefined) {
        result[key] = value;
      }
    }
  }

  // Cast the result back to the original Dictionary type
  return result as Dict;
};
