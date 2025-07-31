import type { BooleanSchema, UnknownSchema } from '../types/jsonSchema';

/**
 * Determines whether a given JSON schema represents a boolean type.
 *
 * Validates that the schema's `type` property is set to `'boolean'`, indicating
 * it describes boolean values (true/false) according to JSON Schema specification.
 * Boolean schemas are typically used for flags, toggles, and binary state validation.
 *
 * @param schema - The JSON schema object to inspect for boolean type characteristics
 * @returns Type-safe boolean indicating whether the schema is a BooleanSchema
 *
 * @example
 * Basic boolean schema detection:
 * ```typescript
 * import { isBooleanSchema } from '@winglet/json-schema';
 *
 * const booleanSchema = {
 *   type: 'boolean',
 *   default: false
 * };
 *
 * const stringSchema = {
 *   type: 'string',
 *   enum: ['true', 'false']
 * };
 *
 * console.log(isBooleanSchema(booleanSchema)); // true
 * console.log(isBooleanSchema(stringSchema)); // false
 * ```
 *
 * @example
 * Type-safe schema processing:
 * ```typescript
 * function processSchema(schema: UnknownSchema) {
 *   if (isBooleanSchema(schema)) {
 *     // TypeScript knows schema is BooleanSchema
 *     console.log('Default value:', schema.default);
 *     console.log('Const value:', schema.const);
 *   }
 * }
 * ```
 *
 * @example
 * Boolean schema validation scenarios:
 * ```typescript
 * const booleanSchemas = [
 *   { type: 'boolean' }, // Simple boolean
 *   { type: 'boolean', default: true }, // With default
 *   { type: 'boolean', const: false }, // Constant boolean
 *   { type: 'boolean', enum: [true] } // Only allows true
 * ];
 *
 * booleanSchemas.forEach((schema, index) => {
 *   if (isBooleanSchema(schema)) {
 *     console.log(`Schema ${index + 1} is a boolean schema`);
 *   }
 * });
 * ```
 *
 * @remarks
 * Boolean schemas are one of the simplest JSON Schema types since boolean
 * values have only two possible states. They support standard JSON Schema
 * properties like:
 * - `default`: Default boolean value
 * - `const`: Restricts to a specific boolean value
 * - `enum`: List of allowed boolean values (typically [true] or [false])
 *
 * This function only validates the `type` property and does not verify
 * the logical consistency of other boolean-specific constraints.
 */
export const isBooleanSchema = (
  schema: UnknownSchema,
): schema is BooleanSchema => schema.type === 'boolean';
