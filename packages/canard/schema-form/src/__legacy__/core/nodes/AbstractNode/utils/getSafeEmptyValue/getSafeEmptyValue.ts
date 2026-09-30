import { getEmptyValue } from '@/schema-form/helpers/defaultValue';
import type { JSONSchemaType } from '@/schema-form/types';

/**
 * Returns default value based on JSON Schema's default property or type
 * @param jsonSchema - JSON Schema
 * @returns Default value
 */
export const getSafeEmptyValue = (value: any, schemaType: JSONSchemaType) => {
  if (value !== undefined) return value;
  return getEmptyValue(schemaType);
};
