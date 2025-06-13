import type { NumberSchema, UnknownSchema } from '../types/jsonSchema';

/**
 * Checks if a schema is a number type.
 * @param schema The JSON schema to check
 * @returns Whether the schema is a number schema
 */
export const isNumberSchema = (schema: UnknownSchema): schema is NumberSchema =>
  schema.type === 'number';
