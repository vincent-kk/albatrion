import type { ArraySchema, UnknownSchema } from '../types/jsonSchema';

/**
 * Determines whether a given JSON schema represents an array type.
 *
 * Validates that the schema's `type` property is set to `'array'`, indicating
 * it describes array values with item validation rules, length constraints,
 * and uniqueness requirements according to JSON Schema specification.
 *
 * @param schema - The JSON schema object to inspect for array type characteristics
 * @returns Type-safe boolean indicating whether the schema is an ArraySchema
 *
 * @example
 * Basic array schema detection:
 * ```typescript
 * import { isArraySchema } from '@winglet/json-schema';
 *
 * const arraySchema = {
 *   type: 'array',
 *   items: { type: 'string' },
 *   minItems: 1,
 *   maxItems: 10
 * };
 *
 * const stringSchema = {
 *   type: 'string',
 *   maxLength: 100
 * };
 *
 * console.log(isArraySchema(arraySchema)); // true
 * console.log(isArraySchema(stringSchema)); // false
 * ```
 *
 * @example
 * Type-safe schema processing:
 * ```typescript
 * function processSchema(schema: UnknownSchema) {
 *   if (isArraySchema(schema)) {
 *     // TypeScript knows schema is ArraySchema
 *     console.log('Array items schema:', schema.items);
 *     console.log('Min items:', schema.minItems);
 *     console.log('Max items:', schema.maxItems);
 *     console.log('Unique items:', schema.uniqueItems);
 *   }
 * }
 * ```
 *
 * @example
 * Complex array schemas:
 * ```typescript
 * const complexArraySchemas = [
 *   {
 *     type: 'array',
 *     items: { type: 'object', properties: { id: { type: 'number' } } },
 *     uniqueItems: true
 *   },
 *   {
 *     type: 'array',
 *     items: { anyOf: [{ type: 'string' }, { type: 'number' }] },
 *     contains: { type: 'string', pattern: '^[A-Z]+
export const isArraySchema = (schema: UnknownSchema): schema is ArraySchema =>
  schema.type === 'array';
 }
 *   }
 * ];
 *
 * complexArraySchemas.forEach(schema => {
 *   if (isArraySchema(schema)) {
 *     console.log('Processing array schema with items:', schema.items);
 *   }
 * });
 * ```
 *
 * @remarks
 * Array schemas support rich validation options:
 * - `items`: Schema for array elements
 * - `minItems`/`maxItems`: Length constraints
 * - `uniqueItems`: Prevent duplicate values
 * - `contains`: At least one element must match schema
 * - `minContains`/`maxContains`: Control contains matching count
 *
 * This function only checks the `type` property and does not validate
 * the completeness or correctness of other array-specific properties.
 */
export const isArraySchema = (schema: UnknownSchema): schema is ArraySchema =>
  schema.type === 'array';
