import { isValidEnum } from '@lumy-pack/schema-form/src/core/nodes/ObjectNode/utils';
import type { ObjectSchema } from '@lumy-pack/schema-form/src/types';

import { isObjectAnyOfSchema } from './getDataWithSchema_anyOf';

export const getInvertedAnyOfMap = (jsonSchema: ObjectSchema) => {
  if (!jsonSchema.anyOf || !Array.isArray(jsonSchema.anyOf)) {
    return null;
  }
  const invertedAnyOf: Map<string, string[]> = new Map();
  jsonSchema.anyOf
    .filter(isObjectAnyOfSchema)
    .forEach(({ properties, required }) => {
      const conditions = Object.entries(properties)
        .filter(isValidEnum)
        .map(([key, value]) =>
          value.enum.length === 1
            ? `${JSON.stringify(value.enum[0])}===@.${key}`
            : `${JSON.stringify(value.enum)}.includes(@.${key})`,
        );
      required.forEach((field) => {
        invertedAnyOf.set(field, [
          ...(invertedAnyOf.get(field) || []),
          ...conditions,
        ]);
      });
    });
  return invertedAnyOf;
};
