import { weakMapCacheFactory } from '@winglet/common-utils';

import type { JsonSchema } from '@/schema-form/types';

type SchemaDetails = {
  oneOfRequiredKeys: Array<string[]>;
  propertyKeys: string[] | null;
};

const { get, set } = weakMapCacheFactory<SchemaDetails, JsonSchema>();

export const getSchemaDetails = (schema: JsonSchema) => {
  let oneOfDetails = get(schema);
  if (!oneOfDetails) {
    oneOfDetails = analyzeOneOfSchema(schema);
    set(schema, oneOfDetails);
  }
  return oneOfDetails;
};

const analyzeOneOfSchema = (schema: JsonSchema): SchemaDetails => {
  const oneOfRequiredKeys: Array<string[]> = [];
  const propertyKeys = schema.properties
    ? Object.keys(schema.properties)
    : null;
  const oneOfLength = schema.oneOf?.length;
  if (!oneOfLength) return { oneOfRequiredKeys, propertyKeys };
  for (let i = 0; i < oneOfLength; i++) {
    const oneOfItem = schema.oneOf![i] as JsonSchema;
    if (!oneOfItem.properties) continue;
    const required = Object.keys(oneOfItem.properties);
    oneOfRequiredKeys.push(required);
  }
  return { oneOfRequiredKeys, propertyKeys };
};
