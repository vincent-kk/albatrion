/**
 * Returns default value based on JSON Schema's default property or type
 * @param jsonSchema - JSON Schema
 * @returns Default value
 */
export const getSafeEmptyValue = <Schema extends { type?: string }>(
  value: any,
  jsonSchema: Schema,
) => {
  if (value !== undefined) return value;
  else if (jsonSchema.type === 'array') return [];
  else if (jsonSchema.type === 'object') return {};
  else return undefined;
};
