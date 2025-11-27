import type {
  NullableObjectSchema,
  ObjectSchema,
  UnknownSchema,
} from '../types/jsonSchema';

import { hasNullInType } from './utils/hasNullInType';

/**
 * Determines whether a given JSON schema represents a non-nullable object type.
 *
 * Validates that the schema's `type` property is set to `'object'` (not an array of types),
 * indicating it describes non-nullable object values.
 *
 * @param schema - The JSON schema object to inspect
 * @returns Type-safe boolean indicating whether the schema is a non-nullable ObjectSchema
 *
 * @example
 * ```typescript
 * isNonNullableObjectSchema({ type: 'object', properties: { name: { type: 'string' } } }); // true
 * isNonNullableObjectSchema({ type: ['object', 'null'] }); // false
 * isNonNullableObjectSchema({ type: 'array' }); // false
 * ```
 */
export const isNonNullableObjectSchema = (
  schema: UnknownSchema,
): schema is ObjectSchema => schema.type === 'object';

/**
 * Determines whether a given JSON schema represents a nullable object type.
 *
 * Validates that the schema's `type` property is an array containing both
 * `'object'` and `'null'`, indicating it describes nullable object values.
 *
 * @param schema - The JSON schema object to inspect
 * @returns Type-safe boolean indicating whether the schema is a NullableObjectSchema
 *
 * @example
 * ```typescript
 * isNullableObjectSchema({ type: ['object', 'null'], properties: {} }); // true
 * isNullableObjectSchema({ type: 'object' }); // false
 * isNullableObjectSchema({ type: ['array', 'null'] }); // false
 * ```
 */
export const isNullableObjectSchema = (
  schema: UnknownSchema,
): schema is NullableObjectSchema =>
  hasNullInType(schema) &&
  Array.isArray(schema.type) &&
  schema.type.indexOf('object') !== -1;

/**
 * Determines whether a given JSON schema represents an object type (nullable or non-nullable).
 *
 * This is a combined filter that matches both `{ type: 'object' }` and
 * `{ type: ['object', 'null'] }` schemas.
 *
 * @param schema - The JSON schema object to inspect
 * @returns Type-safe boolean indicating whether the schema is an object schema (nullable or not)
 *
 * @example
 * ```typescript
 * isObjectSchema({ type: 'object', properties: { name: { type: 'string' } } }); // true
 * isObjectSchema({ type: ['object', 'null'] }); // true
 * isObjectSchema({ type: 'array' }); // false
 * ```
 */
export const isObjectSchema = (
  schema: UnknownSchema,
): schema is ObjectSchema | NullableObjectSchema =>
  isNonNullableObjectSchema(schema) || isNullableObjectSchema(schema);
