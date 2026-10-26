import { isArray } from '@winglet/common-utils/filter';

import type { FieldInputProps, JSONSchema } from '@canard/schema-form';

/**
 * Intersect the authored union schema types with the active jsonSchema.type list.
 * @param schemaType - Authored node schemaType
 * @param jsonSchema - Active JSON Schema at the current render
 * @returns Effective union type names in authored order
 */
export const readEffectiveTypes = (
  schemaType: FieldInputProps['schemaType'],
  jsonSchema: JSONSchema,
) => {
  const authored = isArray(schemaType) ? schemaType : [schemaType];
  const type = jsonSchema.type;
  const effective: readonly string[] = isArray(type)
    ? type
    : type === undefined
      ? authored
      : [type];
  return authored.filter(
    (kind): kind is string => kind !== undefined && effective.includes(kind),
  );
};
