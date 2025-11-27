import type {
  NullableNumberSchema,
  NumberSchema,
  UnknownSchema,
} from '../types/jsonSchema';

import { hasNullInType } from './utils/hasNullInType';

/**
 * Determines whether a given JSON schema represents a non-nullable number type.
 *
 * Validates that the schema's `type` property is set to `'number'` or `'integer'`
 * (not an array), indicating it describes non-nullable numeric values.
 *
 * @param schema - The JSON schema object to inspect
 * @returns Type-safe boolean indicating whether the schema is a non-nullable NumberSchema
 *
 * @example
 * ```typescript
 * isNonNullableNumberSchema({ type: 'number' }); // true
 * isNonNullableNumberSchema({ type: 'integer' }); // true
 * isNonNullableNumberSchema({ type: ['number', 'null'] }); // false
 * isNonNullableNumberSchema({ type: 'string' }); // false
 * ```
 */
export const isNonNullableNumberSchema = (
  schema: UnknownSchema,
): schema is NumberSchema =>
  schema.type === 'number' || schema.type === 'integer';

/**
 * Determines whether a given JSON schema represents a nullable number type.
 *
 * Validates that the schema's `type` property is an array containing both
 * `'number'` (or `'integer'`) and `'null'`, indicating it describes nullable numeric values.
 *
 * @param schema - The JSON schema object to inspect
 * @returns Type-safe boolean indicating whether the schema is a NullableNumberSchema
 *
 * @example
 * ```typescript
 * isNullableNumberSchema({ type: ['number', 'null'] }); // true
 * isNullableNumberSchema({ type: ['integer', 'null'] }); // true
 * isNullableNumberSchema({ type: 'number' }); // false
 * isNullableNumberSchema({ type: ['string', 'null'] }); // false
 * ```
 */
export const isNullableNumberSchema = (
  schema: UnknownSchema,
): schema is NullableNumberSchema =>
  hasNullInType(schema) &&
  Array.isArray(schema.type) &&
  (schema.type.indexOf('number') !== -1 || schema.type.indexOf('integer') !== -1);

/**
 * Determines whether a given JSON schema represents a number type (nullable or non-nullable).
 *
 * This is a combined filter that matches both `{ type: 'number' }`, `{ type: 'integer' }`,
 * `{ type: ['number', 'null'] }`, and `{ type: ['integer', 'null'] }` schemas.
 *
 * @param schema - The JSON schema object to inspect
 * @returns Type-safe boolean indicating whether the schema is a number schema (nullable or not)
 *
 * @example
 * ```typescript
 * isNumberSchema({ type: 'number' }); // true
 * isNumberSchema({ type: 'integer' }); // true
 * isNumberSchema({ type: ['number', 'null'] }); // true
 * isNumberSchema({ type: 'string' }); // false
 * ```
 */
export const isNumberSchema = (
  schema: UnknownSchema,
): schema is NumberSchema | NullableNumberSchema =>
  isNonNullableNumberSchema(schema) || isNullableNumberSchema(schema);
