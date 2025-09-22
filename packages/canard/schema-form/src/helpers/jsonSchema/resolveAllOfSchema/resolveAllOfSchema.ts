import { clone } from '@winglet/common-utils/object';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { getMergeSchema } from './getMergeSchema';

export const resolveAllOfSchema = (schema: JsonSchemaWithVirtual) => {
  if (!schema.allOf?.length) return schema;
  const mergeSchema = getMergeSchema(schema.type);
  if (!mergeSchema) return schema;

  schema = clone(schema);
  for (let i = 0, l = schema.allOf!.length; i < l; i++)
    schema = mergeSchema(schema, schema.allOf![i]);
  return schema;
};
