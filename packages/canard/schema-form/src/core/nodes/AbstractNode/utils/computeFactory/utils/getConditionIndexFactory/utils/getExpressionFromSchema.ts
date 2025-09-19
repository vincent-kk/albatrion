import { isArray, isPlainObject } from '@winglet/common-utils/filter';

import type { Dictionary } from '@aileron/declare';

import { ENHANCED_KEY } from '@/schema-form/app/constants/internal';
import {
  type ConditionDictionary,
  convertExpression,
} from '@/schema-form/helpers/dynamicExpression';
import { JSONPointer } from '@/schema-form/helpers/jsonPointer';
import type { PartialJsonSchema } from '@/schema-form/types';

export const getExpressionFromSchema = (schema: PartialJsonSchema) => {
  const properties = schema.properties as Dictionary<PartialJsonSchema>;
  if (!isPlainObject(properties)) return null;
  const condition: ConditionDictionary = {};
  for (const [key, subSchema] of Object.entries(properties)) {
    if (key === ENHANCED_KEY) continue;
    if (subSchema.type !== undefined || subSchema.$ref !== undefined) continue;
    if ('const' in subSchema) condition[key] = subSchema.const;
    else if ('enum' in subSchema && isArray(subSchema.enum)) {
      if (subSchema.enum.length === 1) condition[key] = subSchema.enum[0];
      else if (subSchema.enum.length > 1) condition[key] = subSchema.enum;
    }
  }
  return convertExpression(condition, false, JSONPointer.Current);
};
