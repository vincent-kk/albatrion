import { isArray } from '@winglet/common-utils/filter';

import type { Nullish } from '@aileron/declare';

import type { ArrayValue } from '@/schema-form/types';

/**
 * Removes consecutive trailing `undefined` items from an array value.
 * @param value - Array value to filter, or nullish (passed through unchanged)
 * @returns The same reference when there is nothing to remove; otherwise a sliced copy without the trailing `undefined` items
 * @remarks Leading and middle `undefined` items are preserved — removing them would shift indices and break error paths and validation mappings.
 */
export const omitTrailingArray = (value: ArrayValue | Nullish) => {
  if (!isArray(value)) return value;
  let length = value.length;
  while (length > 0 && value[length - 1] === undefined) length--;
  return length === value.length ? value : value.slice(0, length);
};
