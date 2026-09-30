import { isArray } from '@winglet/common-utils/filter';

import type { ArrayValue } from '@/schema-form/types';

/**
 * Parses input value to array format.
 *
 * Behavior:
 * - array type: Returns the array as-is
 * - other types: Returns empty array []
 *
 * This function uses strict array type checking (isArray utility)
 * to ensure only actual arrays are preserved.
 *
 * @param value - Value to parse (any type)
 * @returns Parsed array or empty array if input is not an array
 *
 * @example
 * parseArray([1, 2, 3]) // [1, 2, 3]
 * parseArray('hello') // []
 * parseArray(null) // []
 * parseArray({0: 'a', 1: 'b', length: 2}) // [] (array-like object)
 */
export const parseArray = (value: unknown): ArrayValue => {
  return isArray(value) ? value : [];
};
