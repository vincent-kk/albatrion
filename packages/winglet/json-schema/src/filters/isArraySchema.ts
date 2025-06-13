import type { ArraySchema, UnknownSchema } from '../types/jsonSchema';

/**
 * Checks if a schema is an array type.
 * @param schema The JSON schema to check
 * @returns Whether the schema is an array schema
 */
export const isArraySchema = (schema: UnknownSchema): schema is ArraySchema =>
  schema.type === 'array';
