import type { ObjectSchema, UnknownSchema } from '../types/jsonSchema';

/**
 * Determines whether a given JSON schema represents an object type.
 *
 * Validates that the schema's `type` property is set to `'object'`, indicating
 * it describes object values with property validation, required fields,
 * and structural constraints according to JSON Schema specification.
 *
 * @param schema - The JSON schema object to inspect for object type characteristics
 * @returns Type-safe boolean indicating whether the schema is an ObjectSchema
 *
 * @example
 * Basic object schema detection:
 * ```typescript
 * import { isObjectSchema } from '@winglet/json-schema';
 *
 * const objectSchema = {
 *   type: 'object',
 *   properties: {
 *     name: { type: 'string' },
 *     age: { type: 'number' }
 *   },
 *   required: ['name']
 * };
 *
 * const arraySchema = {
 *   type: 'array',
 *   items: { type: 'object' }
 * };
 *
 * console.log(isObjectSchema(objectSchema)); // true
 * console.log(isObjectSchema(arraySchema)); // false
 * ```
 *
 * @example
 * Type-safe schema processing:
 * ```typescript
 * function processSchema(schema: UnknownSchema) {
 *   if (isObjectSchema(schema)) {
 *     // TypeScript knows schema is ObjectSchema
 *     console.log('Properties:', Object.keys(schema.properties || {}));
 *     console.log('Required fields:', schema.required);
 *     console.log('Additional properties:', schema.additionalProperties);
 *     console.log('Min properties:', schema.minProperties);
 *     console.log('Max properties:', schema.maxProperties);
 *   }
 * }
 * ```
 *
 * @example
 * Complex object validation schemas:
 * ```typescript
 * const objectSchemas = [
 *   {
 *     type: 'object',
 *     properties: {
 *       id: { type: 'number' },
 *       name: { type: 'string', minLength: 1 },
 *       email: { type: 'string', format: 'email' }
 *     },
 *     required: ['id', 'name'],
 *     additionalProperties: false
 *   },
 *   {
 *     type: 'object',
 *     patternProperties: {
 *       '^[a-zA-Z]+
export const isObjectSchema = (schema: UnknownSchema): schema is ObjectSchema =>
  schema.type === 'object';
: { type: 'string' } // Dynamic property names
 *     },
 *     minProperties: 1,
 *     maxProperties: 10
 *   },
 *   {
 *     type: 'object',
 *     dependencies: {
 *       creditCard: {
 *         properties: {
 *           billingAddress: { type: 'string' }
 *         },
 *         required: ['billingAddress']
 *       }
 *     }
 *   }
 * ];
 *
 * objectSchemas.forEach((schema, index) => {
 *   if (isObjectSchema(schema)) {
 *     console.log(`Schema ${index + 1} validates object structures`);
 *   }
 * });
 * ```
 *
 * @example
 * Form schema validation:
 * ```typescript
 * const userFormSchema = {
 *   type: 'object',
 *   properties: {
 *     profile: {
 *       type: 'object',
 *       properties: {
 *         firstName: { type: 'string', minLength: 1 },
 *         lastName: { type: 'string', minLength: 1 },
 *         avatar: { type: 'string', format: 'uri' }
 *       },
 *       required: ['firstName', 'lastName']
 *     },
 *     preferences: {
 *       type: 'object',
 *       additionalProperties: { type: 'boolean' }
 *     }
 *   },
 *   required: ['profile']
 * };
 *
 * function validateNestedObjects(schema: UnknownSchema, path = '') {
 *   if (isObjectSchema(schema)) {
 *     console.log(`${path} is an object schema`);
 *     if (schema.properties) {
 *       Object.entries(schema.properties).forEach(([key, propSchema]) => {
 *         validateNestedObjects(propSchema, `${path}.${key}`);
 *       });
 *     }
 *   }
 * }
 *
 * validateNestedObjects(userFormSchema, 'root');
 * ```
 *
 * @remarks
 * Object schemas support rich validation features:
 * - `properties`: Define specific property schemas
 * - `patternProperties`: Schema for properties matching regex patterns
 * - `additionalProperties`: Control unknown properties (boolean or schema)
 * - `required`: Array of required property names
 * - `minProperties`/`maxProperties`: Property count constraints
 * - `dependencies`: Conditional property requirements
 * - `dependentRequired`/`dependentSchemas`: Advanced conditional logic
 *
 * This function only validates the `type` property and does not verify
 * the completeness or logical consistency of object-specific constraints.
 */
export const isObjectSchema = (schema: UnknownSchema): schema is ObjectSchema =>
  schema.type === 'object';
