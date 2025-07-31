import type { NumberSchema, UnknownSchema } from '../types/jsonSchema';

/**
 * Determines whether a given JSON schema represents a number type.
 *
 * Validates that the schema's `type` property is set to `'number'`, indicating
 * it describes numeric values (integers and floating-point numbers) according to
 * JSON Schema specification. Number schemas support range constraints, multiple
 * validation, and format specifications.
 *
 * @param schema - The JSON schema object to inspect for number type characteristics
 * @returns Type-safe boolean indicating whether the schema is a NumberSchema
 *
 * @example
 * Basic number schema detection:
 * ```typescript
 * import { isNumberSchema } from '@winglet/json-schema';
 *
 * const numberSchema = {
 *   type: 'number',
 *   minimum: 0,
 *   maximum: 100
 * };
 *
 * const integerSchema = {
 *   type: 'integer', // Note: this would return false, as it's technically 'integer'
 *   minimum: 1
 * };
 *
 * const stringSchema = {
 *   type: 'string',
 *   pattern: '^[0-9]+
export const isNumberSchema = (schema: UnknownSchema): schema is NumberSchema =>
  schema.type === 'number';

 * };
 *
 * console.log(isNumberSchema(numberSchema)); // true
 * console.log(isNumberSchema(integerSchema)); // false (type is 'integer', not 'number')
 * console.log(isNumberSchema(stringSchema)); // false
 * ```
 *
 * @example
 * Type-safe schema processing:
 * ```typescript
 * function processSchema(schema: UnknownSchema) {
 *   if (isNumberSchema(schema)) {
 *     // TypeScript knows schema is NumberSchema
 *     console.log('Min value:', schema.minimum);
 *     console.log('Max value:', schema.maximum);
 *     console.log('Exclusive min:', schema.exclusiveMinimum);
 *     console.log('Multiple of:', schema.multipleOf);
 *     console.log('Format:', schema.format);
 *   }
 * }
 * ```
 *
 * @example
 * Complex number validation schemas:
 * ```typescript
 * const numberSchemas = [
 *   {
 *     type: 'number',
 *     minimum: 0,
 *     maximum: 1,
 *     multipleOf: 0.1 // Percentage values
 *   },
 *   {
 *     type: 'number',
 *     exclusiveMinimum: 0,
 *     format: 'double' // 64-bit floating point
 *   },
 *   {
 *     type: 'number',
 *     enum: [1.5, 2.5, 3.5], // Specific allowed values
 *     default: 1.5
 *   }
 * ];
 *
 * numberSchemas.forEach((schema, index) => {
 *   if (isNumberSchema(schema)) {
 *     console.log(`Schema ${index + 1} validates number values`);
 *   }
 * });
 * ```
 *
 * @example
 * Form field number validation:
 * ```typescript
 * const formSchema = {
 *   age: { type: 'number', minimum: 0, maximum: 150 },
 *   price: { type: 'number', minimum: 0, multipleOf: 0.01 }, // Currency
 *   rating: { type: 'number', minimum: 1, maximum: 5, multipleOf: 0.5 } // Star rating
 * };
 *
 * Object.entries(formSchema).forEach(([fieldName, schema]) => {
 *   if (isNumberSchema(schema)) {
 *     console.log(`${fieldName} accepts numeric input`);
 *   }
 * });
 * ```
 *
 * @remarks
 * Number schemas support extensive validation options:
 * - `minimum`/`maximum`: Inclusive range bounds
 * - `exclusiveMinimum`/`exclusiveMaximum`: Exclusive range bounds
 * - `multipleOf`: Value must be multiple of specified number
 * - `format`: Specific number format (e.g., 'float', 'double')
 *
 * **Important Note**: This function only matches `type: 'number'` and will
 * return `false` for `type: 'integer'` schemas, even though integers are
 * technically numbers. For integer detection, use a separate type guard
 * or check for `schema.type === 'integer'` explicitly.
 *
 * JSON Schema treats 'number' and 'integer' as distinct types where:
 * - `number`: Any numeric value (including decimals)
 * - `integer`: Whole numbers only (no decimal places)
 */
export const isNumberSchema = (schema: UnknownSchema): schema is NumberSchema =>
  schema.type === 'number';
