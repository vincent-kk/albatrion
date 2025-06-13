import type { ObjectSchema, UnknownSchema } from '../types/jsonSchema';

/**
 * Checks if a schema is an object type.
 * @param schema The JSON schema to check
 * @returns Whether the schema is an object schema
 */
export const isObjectSchema = (schema: UnknownSchema): schema is ObjectSchema =>
  schema.type === 'object';
