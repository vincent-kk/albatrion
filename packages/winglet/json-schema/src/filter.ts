import type {
  ArraySchema,
  BooleanSchema,
  NullSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
} from './types/jsonSchema';

type Schema = { type: string };

export const isArraySchema = (schema: Schema): schema is ArraySchema =>
  schema.type === 'array';

export const isNumberSchema = (schema: Schema): schema is NumberSchema =>
  schema.type === 'number';

export const isObjectSchema = (schema: Schema): schema is ObjectSchema =>
  schema.type === 'object';

export const isStringSchema = (schema: Schema): schema is StringSchema =>
  schema.type === 'string';

export const isBooleanSchema = (schema: Schema): schema is BooleanSchema =>
  schema.type === 'boolean';

export const isNullSchema = (schema: Schema): schema is NullSchema =>
  schema.type === 'null';
