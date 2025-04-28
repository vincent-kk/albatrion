import type { Fn } from '@aileron/declare';

import type { JsonSchema, JsonSchemaWithVirtual } from '@/schema-form/types';

import { getReferenceTable } from './utils/getReferenceTable';
import { getResolveSchemaScanner } from './utils/getResolveSchemaScanner';

export const getResolveSchema = (
  jsonSchema: JsonSchema,
  maxDepth: number = 1,
): ResolveSchema | null => {
  const table = getReferenceTable(jsonSchema);
  const scanner = table ? getResolveSchemaScanner(table, maxDepth) : null;
  return scanner
    ? (schema: JsonSchemaWithVirtual) =>
        scanner.scan(schema).getValue() || schema
    : null;
};

export type ResolveSchema = Fn<
  [schema: JsonSchemaWithVirtual],
  JsonSchemaWithVirtual
>;
