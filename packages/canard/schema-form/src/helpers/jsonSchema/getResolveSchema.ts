import type { Fn } from '@aileron/declare';

import type { JsonSchema, JsonSchemaWithVirtual } from '@/schema-form/types';

import { getReferenceTable } from './utils/getReferenceTable';

export const getResolveSchema = (jsonSchema: JsonSchema): ResolveSchema => {
  const referenceTable = getReferenceTable(jsonSchema);
  return (schema: JsonSchemaWithVirtual) => {
    if (referenceTable && typeof schema.$ref === 'string')
      return referenceTable.get(schema.$ref) || schema;
    return schema;
  };
};

export type ResolveSchema = Fn<
  [schema: JsonSchemaWithVirtual],
  JsonSchemaWithVirtual
>;
