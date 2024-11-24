import type { ObjectSchema } from '@lumy/schema-form/types';

import { isObjectOneOfSchema, isValidEnum } from './filter';

export const getOneOfConditionsMap = (jsonSchema: ObjectSchema) => {
  if (!jsonSchema.oneOf || !Array.isArray(jsonSchema.oneOf)) {
    return null;
  }
  const oneOfConditionsMap: Map<string, string[]> = new Map();
  jsonSchema.oneOf
    .filter(isObjectOneOfSchema)
    .forEach(({ properties, required }) => {
      const conditions = Object.entries(properties)
        .filter(isValidEnum)
        .map(([key, value]) =>
          value.enum.length === 1
            ? `${JSON.stringify(value.enum[0])}===@.${key}`
            : `${JSON.stringify(value.enum)}.includes(@.${key})`,
        );
      required.forEach((field) => {
        oneOfConditionsMap.set(field, [
          ...(oneOfConditionsMap.get(field) || []),
          ...conditions,
        ]);
      });
    });
  return oneOfConditionsMap;
};
