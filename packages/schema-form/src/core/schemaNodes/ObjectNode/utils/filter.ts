import type { JsonSchema, ObjectSchema } from '@lumy/schema-form/types';

export const isObjectAnyOfSchema = (
  schema: NonNullable<ObjectSchema['anyOf']>[number],
): schema is RequiredBy<ObjectSchema, 'properties' | 'required'> =>
  schema.type === 'object' &&
  Array.isArray(schema.properties) &&
  Array.isArray(schema.required);

export const isValidEnum = (
  entire: [key: string, value: JsonSchema],
): entire is [key: string, value: RequiredBy<JsonSchema, 'enum'>] =>
  !!entire[1].enum?.length;
