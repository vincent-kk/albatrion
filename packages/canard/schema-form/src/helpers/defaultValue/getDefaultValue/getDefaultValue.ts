import { extractSchemaInfo } from '@/schema-form/helpers/jsonSchema';
import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { getEmptyValue } from '../getEmptyValue';

/**
 * Returns default value from JSON Schema's default property or based on type
 * @param jsonSchema - JSON Schema
 * @returns Default value
 */
export const getDefaultValue = <
  Schema extends {
    type?: JsonSchemaWithVirtual['type'];
    default?: any;
  },
>(
  jsonSchema: Schema,
) => {
  if (jsonSchema.default !== undefined) return jsonSchema.default;
  if (jsonSchema.type === 'virtual') return [];
  const schemaInfo = extractSchemaInfo(jsonSchema);
  if (schemaInfo === null) return undefined;
  return getEmptyValue(schemaInfo.type);
};
