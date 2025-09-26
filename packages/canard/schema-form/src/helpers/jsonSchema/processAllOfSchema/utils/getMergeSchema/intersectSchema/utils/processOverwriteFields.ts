import type { JsonSchema } from '@/schema-form/types';

import { EXCLUDE_FIELDS } from './constants';

/**
 * Processes overwrite fields by copying source values to base, excluding special fields.
 *
 * This function implements the "overwrite" strategy for schema fields that are not
 * handled by special processing logic. It copies all fields from source to base
 * except those in the EXCLUDE_FIELDS set (first-win, special, and ignored fields).
 *
 * @param base - The base schema to modify
 * @param source - The source schema to copy fields from
 */
export function processOverwriteFields<T extends JsonSchema>(
  base: T,
  source: Partial<T>,
) {
  const keys = Object.keys(source);
  for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
    const value = source[k];
    if (EXCLUDE_FIELDS.has(k) || value === undefined) continue;
    base[k as keyof T] = value;
  }
}
