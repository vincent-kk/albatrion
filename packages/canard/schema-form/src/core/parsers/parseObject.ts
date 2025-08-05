import { isPlainObject } from '@winglet/common-utils/filter';

import type { ObjectValue } from '@/schema-form/types';

/**
 * Parses input value to object format.
 *
 * Behavior:
 * - plain object type: Returns the object as-is
 * - other types: Returns empty object {}
 *
 * This function uses strict plain object checking (isPlainObject utility)
 * to ensure only actual plain objects are preserved. Arrays, functions,
 * class instances, and other object-like values are rejected.
 *
 * Plain object definition:
 * - Created by Object literal {} or new Object()
 * - Has Object.prototype as prototype or null prototype
 * - Excludes arrays, functions, Date, RegExp, etc.
 *
 * @param value - Value to parse (any type)
 * @returns Parsed object or empty object if input is not a plain object
 *
 * @example
 * parseObject({a: 1, b: 2}) // {a: 1, b: 2}
 * parseObject([1, 2, 3]) // {} (array is not plain object)
 * parseObject(new Date()) // {} (Date instance is not plain object)
 * parseObject(null) // {}
 * parseObject('hello') // {}
 */
export const parseObject = (value: unknown): ObjectValue => {
  return isPlainObject(value) ? value : {};
};
