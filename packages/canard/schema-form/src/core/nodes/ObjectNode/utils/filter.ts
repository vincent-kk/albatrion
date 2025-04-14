import { isArray, isPlainObject } from '@winglet/common-utils';

import type { RequiredBy } from '@aileron/types';

import type { JsonSchemaWithVirtual, ObjectSchema } from '@/schema-form/types';

export const isObjectOneOfSchema = (
  schema: NonNullable<ObjectSchema['oneOf']>[number],
): schema is RequiredBy<ObjectSchema, 'properties' | 'required'> =>
  isPlainObject(schema.properties) && isArray(schema.required);

export const isValidEnum = (
  schema: JsonSchemaWithVirtual,
): schema is RequiredBy<JsonSchemaWithVirtual, 'enum'> => !!schema.enum?.length;

export const isValidConst = (
  schema: JsonSchemaWithVirtual,
): schema is RequiredBy<JsonSchemaWithVirtual, 'const'> =>
  schema.const !== undefined;
