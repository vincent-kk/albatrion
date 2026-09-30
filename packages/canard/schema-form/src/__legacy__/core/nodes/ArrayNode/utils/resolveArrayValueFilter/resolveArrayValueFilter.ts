import type { Nullish } from '@aileron/declare';

import type { ArraySchema, ArrayValue } from '@/schema-form/types';

import { omitEmptyArray } from '../omitEmptyArray';
import { omitTrailingArray } from '../omitTrailingArray';

/**
 * Composes the outgoing-value filter for an array node from its schema options.
 * @param options - `ArraySchema.options`; reads `omitTrailing` (opt-in) and `omitEmpty` (opt-out)
 * @returns Filter applied to values leaving the node — trailing `undefined` removal first, then empty-array omission; identity when both are disabled
 */
export const resolveArrayValueFilter = (
  options: ArraySchema['options'],
): ((value: ArrayValue | Nullish) => ArrayValue | Nullish) => {
  const omitTrailing = options?.omitTrailing === true;
  const omitEmpty = options?.omitEmpty !== false;
  if (omitTrailing && omitEmpty)
    return (value) => omitEmptyArray(omitTrailingArray(value));
  if (omitTrailing) return omitTrailingArray;
  if (omitEmpty) return omitEmptyArray;
  return (value) => value;
};
