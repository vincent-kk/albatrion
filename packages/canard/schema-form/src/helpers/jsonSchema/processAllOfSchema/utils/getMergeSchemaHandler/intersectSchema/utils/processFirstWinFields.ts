import type { JsonSchema } from '@/schema-form/types';

import { FIRST_WIN_FIELDS } from './constants';

/**
 * Processes first-win fields by preserving base values over source values.
 *
 * This function implements the "first-win" strategy for specific schema fields
 * where the base schema's value takes precedence. If the base doesn't have a value,
 * the source value is used. This is typically used for metadata fields like
 * title, description, examples, etc.
 *
 * @param base - The base schema to modify (first-win priority)
 * @param source - The source schema to merge from
 */
export const processFirstWinFields = <T extends JsonSchema>(
  base: T,
  source: Partial<T>,
) => {
  for (let i = 0, l = FIRST_WIN_FIELDS.length; i < l; i++) {
    const field = FIRST_WIN_FIELDS[i];
    const baseValue = base[field as keyof T];
    const sourceValue = source[field as keyof T];
    if (baseValue !== undefined) base[field as keyof T] = baseValue;
    else if (sourceValue !== undefined) base[field as keyof T] = sourceValue;
  }
};
