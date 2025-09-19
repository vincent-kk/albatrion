import { getEmptyValue } from '@/schema-form/helpers/defaultValue';

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
  return getEmptyValue(jsonSchema.type);
};
