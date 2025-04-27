import type { JsonSchema } from '@/schema-form/types';

import { getReferenceTableFromSchema } from './utils/getReferenceTableFromSchema';
import { getSchemaResolverByReferenceTable } from './utils/getSchemaResolverByReferenceTable';

export const getJsonSchemaResolver = (jsonSchema: JsonSchema) => {
  const referenceTable = getReferenceTableFromSchema(jsonSchema);
  if (referenceTable.size === 0) return undefined;
  return getSchemaResolverByReferenceTable(referenceTable);
};
