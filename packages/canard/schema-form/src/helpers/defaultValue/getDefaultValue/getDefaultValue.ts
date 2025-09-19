import { getEmptyValue } from '../getEmptyValue';

/**
 * Returns default value from JSON Schema's default property or based on type
 * @param jsonSchema - JSON Schema
 * @returns Default value
 */
export const getDefaultValue = <
  Schema extends { type?: string; default?: any },
>(
  jsonSchema: Schema,
) => {
  if (jsonSchema.default !== undefined) return jsonSchema.default;
  if (jsonSchema.type === 'virtual') return [];
  return getEmptyValue(jsonSchema.type);
};
