import { isPlainObject } from '@winglet/common-utils/filter';

import type { ObjectValue } from '@/schema-form/types';

/**
 * Parses input value to object format.
 * @param value - Value to parse
 * @returns Parsed object or empty object if not an object
 * @typeParam T - Type of object properties
 */
export const parseObject = (value: unknown): ObjectValue => {
  return isPlainObject(value) ? value : {};
};
