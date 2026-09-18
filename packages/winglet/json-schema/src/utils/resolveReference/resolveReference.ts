import { getValue } from '@winglet/json/pointer';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';
import { JSONSchemaScanner } from '@/json-schema/utils/JSONSchemaScanner/sync';

export const resolveReference = (
  jsonSchema: UnknownSchema,
): UnknownSchema | undefined => {
  const definitionMap = new Map<string, UnknownSchema>();
  new JSONSchemaScanner({
    visitor: {
      exit: ({ schema, hasReference }) => {
        if (hasReference && typeof schema.$ref === 'string')
          definitionMap.set(schema.$ref, getValue(jsonSchema, schema.$ref));
      },
    },
  }).scan(jsonSchema);
  return new JSONSchemaScanner({
    options: {
      resolveReference: (path) => definitionMap.get(path),
    },
  })
    .scan(jsonSchema)
    .getValue();
};
