import type { NullSchema, UnknownSchema } from '../types/jsonSchema';

/**
 * Determines whether a given JSON schema represents a null type.
 *
 * Validates that the schema's `type` property is set to `'null'`, indicating
 * it describes null values according to JSON Schema specification. Null schemas
 * are used to explicitly allow null values in validation, often combined with
 * other types in union schemas or nullable fields.
 *
 * @param schema - The JSON schema object to inspect for null type characteristics
 * @returns Type-safe boolean indicating whether the schema is a NullSchema
 *
 * @example
 * Basic null schema detection:
 * ```typescript
 * import { isNullSchema } from '@winglet/json-schema';
 *
 * const nullSchema = {
 *   type: 'null'
 * };
 *
 * const nullableStringSchema = {
 *   anyOf: [
 *     { type: 'string' },
 *     { type: 'null' }
 *   ]
 * };
 *
 * console.log(isNullSchema(nullSchema)); // true
 * console.log(isNullSchema(nullableStringSchema)); // false (union, not pure null)
 * ```
 *
 * @example
 * Type-safe schema processing:
 * ```typescript
 * function processSchema(schema: UnknownSchema) {
 *   if (isNullSchema(schema)) {
 *     // TypeScript knows schema is NullSchema
 *     console.log('Nullable property:', schema.nullable);
 *     console.log('Default value:', schema.default); // Should be null
 *   }
 * }
 * ```
 *
 * @example
 * Handling union schemas with null:
 * ```typescript
 * const unionSchemas = [
 *   { type: 'null' }, // Pure null schema
 *   { anyOf: [{ type: 'string' }, { type: 'null' }] }, // Union with null
 *   { type: 'string', nullable: true } // Nullable string (different pattern)
 * ];
 *
 * unionSchemas.forEach((schema, index) => {
 *   if (isNullSchema(schema)) {
 *     console.log(`Schema ${index + 1} is a pure null schema`);
 *   } else {
 *     console.log(`Schema ${index + 1} might allow null but isn't a null schema`);
 *   }
 * });
 * ```
 *
 * @example
 * Null schema in form validation:
 * ```typescript
 * const formFieldSchemas = {
 *   requiredField: { type: 'string', minLength: 1 },
 *   optionalField: { anyOf: [{ type: 'string' }, { type: 'null' }] },
 *   explicitNull: { type: 'null' } // Field that must be null
 * };
 *
 * Object.entries(formFieldSchemas).forEach(([fieldName, schema]) => {
 *   if (isNullSchema(schema)) {
 *     console.log(`${fieldName} must be null`);
 *   }
 * });
 * ```
 *
 * @remarks
 * Null schemas are used in specific validation scenarios:
 * - Explicitly allowing null values
 * - Creating union types that include null
 * - Defining fields that must be null (rare but valid)
 *
 * Note the difference between:
 * - `{ type: 'null' }`: Value must be null
 * - `{ type: 'string', nullable: true }`: Value can be string or null
 * - `{ anyOf: [{ type: 'string' }, { type: 'null' }] }`: Union allowing string or null
 *
 * This function only identifies pure null schemas, not nullable variations.
 */
export const isNullSchema = (schema: UnknownSchema): schema is NullSchema =>
  schema.type === 'null';
