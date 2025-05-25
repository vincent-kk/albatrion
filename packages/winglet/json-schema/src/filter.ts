import type {
  ArraySchema,
  BooleanSchema,
  NullSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
  UnknownSchema,
} from './types/jsonSchema';

/**
 * Checks if a schema is an array type.
 * @param schema The JSON schema to check
 * @returns Whether the schema is an array schema
 */
export const isArraySchema = (schema: UnknownSchema): schema is ArraySchema =>
  schema.type === 'array';

/**
 * Checks if a schema is a number type.
 * @param schema The JSON schema to check
 * @returns Whether the schema is a number schema
 */
export const isNumberSchema = (schema: UnknownSchema): schema is NumberSchema =>
  schema.type === 'number';

/**
 * Checks if a schema is an object type.
 * @param schema The JSON schema to check
 * @returns Whether the schema is an object schema
 */
export const isObjectSchema = (schema: UnknownSchema): schema is ObjectSchema =>
  schema.type === 'object';

/**
 * Checks if a schema is a string type.
 * @param schema The JSON schema to check
 * @returns Whether the schema is a string schema
 */
export const isStringSchema = (schema: UnknownSchema): schema is StringSchema =>
  schema.type === 'string';

/**
 * Checks if a schema is a boolean type.
 * @param schema The JSON schema to check
 * @returns Whether the schema is a boolean schema
 */
export const isBooleanSchema = (
  schema: UnknownSchema,
): schema is BooleanSchema => schema.type === 'boolean';

/**
 * Checks if a schema is a null type.
 * @param schema The JSON schema to check
 * @returns Whether the schema is a null schema
 */
export const isNullSchema = (schema: UnknownSchema): schema is NullSchema =>
  schema.type === 'null';
