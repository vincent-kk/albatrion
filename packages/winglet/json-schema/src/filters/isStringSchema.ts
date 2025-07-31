import type { StringSchema, UnknownSchema } from '../types/jsonSchema';

/**
 * Determines whether a given JSON schema represents a string type.
 *
 * Validates that the schema's `type` property is set to `'string'`, indicating
 * it describes string values with length constraints, pattern matching,
 * and format validation according to JSON Schema specification.
 *
 * @param schema - The JSON schema object to inspect for string type characteristics
 * @returns Type-safe boolean indicating whether the schema is a StringSchema
 *
 * @example
 * Basic string schema detection:
 * ```typescript
 * import { isStringSchema } from '@winglet/json-schema';
 *
 * const stringSchema = {
 *   type: 'string',
 *   minLength: 1,
 *   maxLength: 100
 * };
 *
 * const numberSchema = {
 *   type: 'number',
 *   minimum: 0
 * };
 *
 * console.log(isStringSchema(stringSchema)); // true
 * console.log(isStringSchema(numberSchema)); // false
 * ```
 *
 * @example
 * Type-safe schema processing:
 * ```typescript
 * function processSchema(schema: UnknownSchema) {
 *   if (isStringSchema(schema)) {
 *     // TypeScript knows schema is StringSchema
 *     console.log('Min length:', schema.minLength);
 *     console.log('Max length:', schema.maxLength);
 *     console.log('Pattern:', schema.pattern);
 *     console.log('Format:', schema.format);
 *   }
 * }
 * ```
 *
 * @example
 * Complex string validation schemas:
 * ```typescript
 * const stringSchemas = [
 *   {
 *     type: 'string',
 *     format: 'email',
 *     maxLength: 254
 *   },
 *   {
 *     type: 'string',
 *     pattern: '^[A-Z]{2}[0-9]{6}
export const isStringSchema = (schema: UnknownSchema): schema is StringSchema =>
  schema.type === 'string';
, // License plate format
 *     minLength: 8,
 *     maxLength: 8
 *   },
 *   {
 *     type: 'string',
 *     enum: ['small', 'medium', 'large'],
 *     default: 'medium'
 *   },
 *   {
 *     type: 'string',
 *     format: 'uri',
 *     pattern: '^https://'
 *   }
 * ];
 *
 * stringSchemas.forEach((schema, index) => {
 *   if (isStringSchema(schema)) {
 *     console.log(`Schema ${index + 1} validates string values`);
 *   }
 * });
 * ```
 *
 * @example
 * Form field string validation:
 * ```typescript
 * const formSchema = {
 *   username: {
 *     type: 'string',
 *     minLength: 3,
 *     maxLength: 20,
 *     pattern: '^[a-zA-Z0-9_]+
export const isStringSchema = (schema: UnknownSchema): schema is StringSchema =>
  schema.type === 'string';

 *   },
 *   email: {
 *     type: 'string',
 *     format: 'email'
 *   },
 *   phone: {
 *     type: 'string',
 *     pattern: '^\+?[1-9]\d{1,14}
export const isStringSchema = (schema: UnknownSchema): schema is StringSchema =>
  schema.type === 'string';
 // E.164 format
 *   },
 *   website: {
 *     type: 'string',
 *     format: 'uri',
 *     pattern: '^https?://'
 *   }
 * };
 *
 * Object.entries(formSchema).forEach(([fieldName, schema]) => {
 *   if (isStringSchema(schema)) {
 *     console.log(`${fieldName} accepts text input`);
 *     if (schema.format) {
 *       console.log(`  - Format: ${schema.format}`);
 *     }
 *     if (schema.pattern) {
 *       console.log(`  - Pattern: ${schema.pattern}`);
 *     }
 *   }
 * });
 * ```
 *
 * @example
 * String format validation scenarios:
 * ```typescript
 * const formatSchemas = {
 *   email: { type: 'string', format: 'email' },
 *   date: { type: 'string', format: 'date' }, // YYYY-MM-DD
 *   time: { type: 'string', format: 'time' }, // HH:mm:ss
 *   datetime: { type: 'string', format: 'date-time' }, // ISO 8601
 *   uri: { type: 'string', format: 'uri' },
 *   uuid: { type: 'string', format: 'uuid' },
 *   ipv4: { type: 'string', format: 'ipv4' },
 *   ipv6: { type: 'string', format: 'ipv6' }
 * };
 *
 * Object.entries(formatSchemas).forEach(([name, schema]) => {
 *   if (isStringSchema(schema)) {
 *     console.log(`${name}: ${schema.format} format validation`);
 *   }
 * });
 * ```
 *
 * @remarks
 * String schemas support comprehensive validation options:
 * - `minLength`/`maxLength`: Character count constraints
 * - `pattern`: Regular expression validation
 * - `format`: Predefined string formats (email, uri, date, etc.)
 * - `enum`: Restrict to specific string values
 * - `const`: Require exact string match
 *
 * Common string formats include:
 * - `email`: Email address validation
 * - `uri`/`url`: URL validation
 * - `date`: Date in YYYY-MM-DD format
 * - `time`: Time in HH:mm:ss format
 * - `date-time`: ISO 8601 datetime
 * - `uuid`: UUID format validation
 * - `ipv4`/`ipv6`: IP address validation
 *
 * This function only checks the `type` property and does not validate
 * the syntax or logical consistency of string-specific constraints.
 */
export const isStringSchema = (schema: UnknownSchema): schema is StringSchema =>
  schema.type === 'string';
