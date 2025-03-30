import type { ObjectSchema } from '@/schema-form/types';

import { isObjectOneOfSchema, isValidEnum } from './filter';

export const getOneOfConditionsMap = (jsonSchema: ObjectSchema) => {
  if (!jsonSchema.oneOf || !Array.isArray(jsonSchema.oneOf)) return null;
  const oneOfConditionsMap: Map<string, string[]> = new Map();
  for (const oneOfSchema of jsonSchema.oneOf) {
    if (!isObjectOneOfSchema(oneOfSchema)) continue;
    const { properties, required } = oneOfSchema;
    const conditions = Object.entries(properties)
      .filter(isValidEnum)
      .map(([key, value]) =>
        value.enum.length === 1
          ? `${JSON.stringify(value.enum[0])}===@.${key}`
          : `${JSON.stringify(value.enum)}.includes(@.${key})`,
      );
    for (const field of required) {
      oneOfConditionsMap.set(field, [
        ...(oneOfConditionsMap.get(field) || []),
        ...conditions,
      ]);
    }
  }
  return oneOfConditionsMap;
};
