import type {
  BooleanSchema,
  NonNullableBooleanSchema,
  NullableBooleanSchema,
  UnknownSchema,
} from '../types/jsonSchema';
import { hasNullInType } from './utils/hasNullInType';

/**
 * Determines whether a given JSON schema represents a non-nullable boolean type.
 *
 * Validates that the schema's `type` property is set to `'boolean'` (not an array),
 * indicating it describes non-nullable boolean values.
 *
 * @param schema - The JSON schema object to inspect
 * @returns Type-safe boolean indicating whether the schema is a non-nullable BooleanSchema
 *
 * @example
 * ```typescript
 * isNonNullableBooleanSchema({ type: 'boolean' }); // true
 * isNonNullableBooleanSchema({ type: ['boolean', 'null'] }); // false
 * isNonNullableBooleanSchema({ type: 'string' }); // false
 * ```
 */
export const isNonNullableBooleanSchema = (
  schema: UnknownSchema,
): schema is NonNullableBooleanSchema => schema.type === 'boolean';

/**
 * Determines whether a given JSON schema represents a nullable boolean type.
 *
 * Validates that the schema's `type` property is an array containing both
 * `'boolean'` and `'null'`, indicating it describes nullable boolean values.
 *
 * @param schema - The JSON schema object to inspect
 * @returns Type-safe boolean indicating whether the schema is a NullableBooleanSchema
 *
 * @example
 * ```typescript
 * isNullableBooleanSchema({ type: ['boolean', 'null'] }); // true
 * isNullableBooleanSchema({ type: 'boolean' }); // false
 * isNullableBooleanSchema({ type: ['string', 'null'] }); // false
 * ```
 */
export const isNullableBooleanSchema = (
  schema: UnknownSchema,
): schema is NullableBooleanSchema =>
  hasNullInType(schema) &&
  Array.isArray(schema.type) &&
  schema.type.indexOf('boolean') !== -1;

/**
 * Determines whether a given JSON schema represents a boolean type (nullable or non-nullable).
 *
 * This is a combined filter that matches both `{ type: 'boolean' }` and
 * `{ type: ['boolean', 'null'] }` schemas.
 *
 * @param schema - The JSON schema object to inspect
 * @returns Type-safe boolean indicating whether the schema is a boolean schema (nullable or not)
 *
 * @example
 * ```typescript
 * isBooleanSchema({ type: 'boolean' }); // true
 * isBooleanSchema({ type: ['boolean', 'null'] }); // true
 * isBooleanSchema({ type: 'string' }); // false
 * ```
 */
export const isBooleanSchema = (
  schema: UnknownSchema,
): schema is BooleanSchema =>
  isNonNullableBooleanSchema(schema) || isNullableBooleanSchema(schema);
