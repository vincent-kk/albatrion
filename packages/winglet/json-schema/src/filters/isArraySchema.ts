import type {
  ArraySchema,
  NullableArraySchema,
  UnknownSchema,
} from '../types/jsonSchema';
import { hasNullInType } from './utils/hasNullInType';

/**
 * Determines whether a given JSON schema represents a non-nullable array type.
 *
 * Validates that the schema's `type` property is set to `'array'` (not an array of types),
 * indicating it describes non-nullable array values.
 *
 * @param schema - The JSON schema object to inspect
 * @returns Type-safe boolean indicating whether the schema is a non-nullable ArraySchema
 *
 * @example
 * ```typescript
 * isNonNullableArraySchema({ type: 'array', items: { type: 'string' } }); // true
 * isNonNullableArraySchema({ type: ['array', 'null'] }); // false
 * isNonNullableArraySchema({ type: 'object' }); // false
 * ```
 */
export const isNonNullableArraySchema = (
  schema: UnknownSchema,
): schema is ArraySchema => schema.type === 'array';

/**
 * Determines whether a given JSON schema represents a nullable array type.
 *
 * Validates that the schema's `type` property is an array containing both
 * `'array'` and `'null'`, indicating it describes nullable array values.
 *
 * @param schema - The JSON schema object to inspect
 * @returns Type-safe boolean indicating whether the schema is a NullableArraySchema
 *
 * @example
 * ```typescript
 * isNullableArraySchema({ type: ['array', 'null'], items: { type: 'string' } }); // true
 * isNullableArraySchema({ type: 'array' }); // false
 * isNullableArraySchema({ type: ['object', 'null'] }); // false
 * ```
 */
export const isNullableArraySchema = (
  schema: UnknownSchema,
): schema is NullableArraySchema =>
  hasNullInType(schema) &&
  Array.isArray(schema.type) &&
  schema.type.indexOf('array') !== -1;

/**
 * Determines whether a given JSON schema represents an array type (nullable or non-nullable).
 *
 * This is a combined filter that matches both `{ type: 'array' }` and
 * `{ type: ['array', 'null'] }` schemas.
 *
 * @param schema - The JSON schema object to inspect
 * @returns Type-safe boolean indicating whether the schema is an array schema (nullable or not)
 *
 * @example
 * ```typescript
 * isArraySchema({ type: 'array', items: { type: 'string' } }); // true
 * isArraySchema({ type: ['array', 'null'] }); // true
 * isArraySchema({ type: 'object' }); // false
 * ```
 */
export const isArraySchema = (
  schema: UnknownSchema,
): schema is ArraySchema | NullableArraySchema =>
  isNonNullableArraySchema(schema) || isNullableArraySchema(schema);
