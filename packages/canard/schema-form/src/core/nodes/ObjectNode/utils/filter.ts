import { isPlainObject } from '@winglet/common-utils';

import type { RequiredBy } from '@aileron/types';

import type { JsonSchema, ObjectSchema } from '@/schema-form/types';

export const isObjectOneOfSchema = (
  schema: NonNullable<ObjectSchema['oneOf']>[number],
): schema is RequiredBy<ObjectSchema, 'properties' | 'required'> =>
  isPlainObject(schema.properties) && Array.isArray(schema.required);

export const isValidEnum = (
  entire: [key: string, value: JsonSchema],
): entire is [key: string, value: RequiredBy<JsonSchema, 'enum'>] =>
  !!entire[1].enum?.length;
