import { isPlainObject } from '@winglet/common-utils';

import type { ObjectValue } from '@/schema-form/types';

/**
 * Parses input value to object format.
 * @param value - Value to parse
 * @returns Parsed object or empty object if not an object
 * @typeParam T - Type of object properties
 */
export const parseObject = (value: unknown): ObjectValue | undefined => {
  if (value === undefined) return undefined;
  return isPlainObject(value) ? value : {};
};
