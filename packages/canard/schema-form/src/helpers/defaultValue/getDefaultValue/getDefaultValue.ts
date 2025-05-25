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
  else if (jsonSchema.type === 'array') return [];
  else if (jsonSchema.type === 'virtual') return [];
  else if (jsonSchema.type === 'object') return {};
  else return undefined;
};
