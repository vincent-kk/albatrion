import type {
  ArraySchema,
  BooleanSchema,
  NullSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
  UnknownSchema,
} from './types/jsonSchema';

export const isArraySchema = (schema: UnknownSchema): schema is ArraySchema =>
  schema.type === 'array';

export const isNumberSchema = (schema: UnknownSchema): schema is NumberSchema =>
  schema.type === 'number';

export const isObjectSchema = (schema: UnknownSchema): schema is ObjectSchema =>
  schema.type === 'object';

export const isStringSchema = (schema: UnknownSchema): schema is StringSchema =>
  schema.type === 'string';

export const isBooleanSchema = (
  schema: UnknownSchema,
): schema is BooleanSchema => schema.type === 'boolean';

export const isNullSchema = (schema: UnknownSchema): schema is NullSchema =>
  schema.type === 'null';
