import type { StringSchema, UnknownSchema } from '../types/jsonSchema';

/**
 * Checks if a schema is a string type.
 * @param schema The JSON schema to check
 * @returns Whether the schema is a string schema
 */
export const isStringSchema = (schema: UnknownSchema): schema is StringSchema =>
  schema.type === 'string';
