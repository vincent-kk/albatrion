import { isPlainObject } from '@winglet/common-utils';

import type { RequiredBy } from '@aileron/types';

import type { JsonSchemaWithVirtual, ObjectSchema } from '@/schema-form/types';

export const isObjectOneOfSchema = (
  schema: NonNullable<ObjectSchema['oneOf']>[number],
): schema is RequiredBy<ObjectSchema, 'properties' | 'required'> =>
  isPlainObject(schema.properties) && Array.isArray(schema.required);

export const isValidEnum = (
  value: JsonSchemaWithVirtual,
): value is RequiredBy<JsonSchemaWithVirtual, 'enum'> => !!value.enum?.length;
