import type {
  NonNullableStringSchema,
  NullableStringSchema,
  StringSchema,
  UnknownSchema,
} from '../types/jsonSchema';
import { hasNullInType } from './utils/hasNullInType';

/**
 * Determines whether a given JSON schema represents a non-nullable string type.
 *
 * Validates that the schema's `type` property is set to `'string'` (not an array),
 * indicating it describes non-nullable string values.
 *
 * @param schema - The JSON schema object to inspect
 * @returns Type-safe boolean indicating whether the schema is a non-nullable StringSchema
 *
 * @example
 * ```typescript
 * isNonNullableStringSchema({ type: 'string' }); // true
 * isNonNullableStringSchema({ type: ['string', 'null'] }); // false
 * isNonNullableStringSchema({ type: 'number' }); // false
 * ```
 */
export const isNonNullableStringSchema = (
  schema: UnknownSchema,
): schema is NonNullableStringSchema => schema.type === 'string';

/**
 * Determines whether a given JSON schema represents a nullable string type.
 *
 * Validates that the schema's `type` property is an array containing both
 * `'string'` and `'null'`, indicating it describes nullable string values.
 *
 * @param schema - The JSON schema object to inspect
 * @returns Type-safe boolean indicating whether the schema is a NullableStringSchema
 *
 * @example
 * ```typescript
 * isNullableStringSchema({ type: ['string', 'null'] }); // true
 * isNullableStringSchema({ type: 'string' }); // false
 * isNullableStringSchema({ type: ['number', 'null'] }); // false
 * ```
 */
export const isNullableStringSchema = (
  schema: UnknownSchema,
): schema is NullableStringSchema =>
  hasNullInType(schema) &&
  Array.isArray(schema.type) &&
  schema.type.indexOf('string') !== -1;

/**
 * Determines whether a given JSON schema represents a string type (nullable or non-nullable).
 *
 * This is a combined filter that matches both `{ type: 'string' }` and
 * `{ type: ['string', 'null'] }` schemas.
 *
 * @param schema - The JSON schema object to inspect
 * @returns Type-safe boolean indicating whether the schema is a string schema (nullable or not)
 *
 * @example
 * ```typescript
 * isStringSchema({ type: 'string' }); // true
 * isStringSchema({ type: ['string', 'null'] }); // true
 * isStringSchema({ type: 'number' }); // false
 * ```
 */
export const isStringSchema = (schema: UnknownSchema): schema is StringSchema =>
  isNonNullableStringSchema(schema) || isNullableStringSchema(schema);
