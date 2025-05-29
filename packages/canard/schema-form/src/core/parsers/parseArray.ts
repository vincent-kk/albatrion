import { isArray } from '@winglet/common-utils';

import type { ArrayValue } from '@/schema-form/types';

/**
 * Parses input value to array format.
 * @param value - Value to parse
 * @returns Parsed array or empty array if not an array
 * @typeParam T - Type of array elements
 */
export const parseArray = (value: unknown): ArrayValue => {
  return isArray(value) ? value : [];
};
