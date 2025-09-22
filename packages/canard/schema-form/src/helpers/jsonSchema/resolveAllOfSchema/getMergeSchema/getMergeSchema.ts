import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import {
  intersectArraySchema,
  intersectBooleanSchema,
  intersectNullSchema,
  intersectNumberSchema,
  intersectObjectSchema,
  intersectStringSchema,
} from './utils/intersectSchema';

export const getMergeSchema = (type: JsonSchemaWithVirtual['type']) => {
  switch (type) {
    case 'array':
      return intersectArraySchema;
    case 'boolean':
      return intersectBooleanSchema;
    case 'null':
      return intersectNullSchema;
    case 'number':
    case 'integer':
      return intersectNumberSchema;
    case 'object':
      return intersectObjectSchema;
    case 'string':
      return intersectStringSchema;
  }
  return null;
};
