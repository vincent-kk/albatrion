import type { RJSFSchema } from '@rjsf/utils';

import type { JsonSchema } from '@canard/schema-form';

import { buildFlatSchema } from '../../fixtures/scale-schemas';

/**
 * Shared flat-N string-field fixture. Every adapter builds the SAME form so
 * the comparison is fair. schema-form and @rjsf/core consume a JSON Schema;
 * RHF / Formik / TanStack consume an equivalent defaultValues object. All
 * variants carry the identical per-field `value_${i}` initial value.
 */

/** schema-form: reuse the existing flat builder (default `value_${i}`). */
export { buildFlatSchema };

export const flatFieldName = (index: number): string =>
  `field_${String(index).padStart(3, '0')}`;

/** rjsf wants the same shape under its own nominal type. Built identically. */
export const flatRjsfSchema = (fieldCount: number): RJSFSchema => {
  const properties: NonNullable<RJSFSchema['properties']> = {};
  for (let i = 0; i < fieldCount; i++)
    properties[flatFieldName(i)] = { type: 'string', default: `value_${i}` };
  return { type: 'object', properties };
};

/** RHF / Formik / TanStack initial values, matching the schema defaults. */
export const flatDefaults = (fieldCount: number): Record<string, string> => {
  const values: Record<string, string> = {};
  for (let i = 0; i < fieldCount; i++) values[flatFieldName(i)] = `value_${i}`;
  return values;
};

/** Sanity re-export so callers can assert shape parity if needed. */
export type FlatSchema = JsonSchema;
