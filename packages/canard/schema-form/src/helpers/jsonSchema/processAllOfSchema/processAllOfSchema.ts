import { clone } from '@winglet/common-utils/object';

import type { JsonSchema } from '@/schema-form/types';

import { getMergeSchema } from './getMergeSchema';

export const processAllOfSchema = (schema: JsonSchema): JsonSchema => {
  if (!schema.allOf?.length) return schema;
  const mergeSchema = getMergeSchema(schema.type);
  if (!mergeSchema) return schema;

  const { allOf, ...rest } = schema;
  schema = clone(rest);
  for (let i = 0, l = allOf!.length; i < l; i++)
    schema = mergeSchema(schema, allOf![i]);
  return schema;
};
