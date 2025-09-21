import { getValue } from '@winglet/json/pointer';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';
import { JsonSchemaScanner } from '@/json-schema/utils/JsonSchemaScanner/sync';

export const resolveReference = (
  jsonSchema: UnknownSchema,
): UnknownSchema | undefined => {
  const definitionMap = new Map<string, UnknownSchema>();
  new JsonSchemaScanner({
    visitor: {
      exit: ({ schema, hasReference }) => {
        if (hasReference && typeof schema.$ref === 'string')
          definitionMap.set(schema.$ref, getValue(jsonSchema, schema.$ref));
      },
    },
  }).scan(jsonSchema);
  return new JsonSchemaScanner({
    options: {
      resolveReference: (path) => definitionMap.get(path),
    },
  })
    .scan(jsonSchema)
    .getValue();
};
