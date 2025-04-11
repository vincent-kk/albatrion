import { serializeNative } from '@winglet/common-utils';

import type { Dictionary } from '@aileron/types';

import type { JsonSchema, ObjectSchema } from '@/schema-form/types';

import { isObjectOneOfSchema, isValidConst, isValidEnum } from './filter';

export const getOneOfConditionsMap = (jsonSchema: ObjectSchema) => {
  if (!jsonSchema.oneOf || !Array.isArray(jsonSchema.oneOf)) return null;
  const oneOfConditionsMap: Map<string, string[]> = new Map();
  for (const oneOfSchema of jsonSchema.oneOf) {
    if (!isObjectOneOfSchema(oneOfSchema)) continue;
    const { properties, required } = oneOfSchema;
    const conditions = getConditions(properties);
    for (const field of required) {
      oneOfConditionsMap.set(field, [
        ...(oneOfConditionsMap.get(field) || []),
        ...conditions,
      ]);
    }
  }
  return oneOfConditionsMap;
};

const getConditions = (properties: Dictionary<JsonSchema>) => {
  const conditions: string[] = [];
  for (const [key, value] of Object.entries(properties)) {
    if (isValidConst(value))
      conditions.push(`@.${key}===${serializeNative(value.const)}`);
    else if (isValidEnum(value))
      conditions.push(
        value.enum.length === 1
          ? `${serializeNative(value.enum[0])}===@.${key}`
          : `${serializeNative(value.enum)}.includes(@.${key})`,
      );
  }
  return conditions;
};
