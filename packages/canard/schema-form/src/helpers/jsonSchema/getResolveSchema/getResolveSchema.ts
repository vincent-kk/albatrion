import type { Fn } from '@aileron/declare';

import type {
  JsonSchema,
  JsonSchemaWithRef,
  JsonSchemaWithVirtual,
} from '@/schema-form/types';

import { getReferenceTable } from './utils/getReferenceTable';
import { getResolveSchemaScanner } from './utils/getResolveSchemaScanner';

/**
 * Creates a function to resolve $ref references in JSON Schema.
 * @param jsonSchema - Original JSON Schema
 * @param maxDepth - Maximum depth for reference resolution (default: 1)
 * @returns Function that can resolve references or null
 */
export const getResolveSchema = (
  jsonSchema: JsonSchema,
  maxDepth: number = 1,
): ResolveSchema | null => {
  const table = getReferenceTable(jsonSchema);
  const scanner = table ? getResolveSchemaScanner(table, maxDepth) : null;
  return scanner
    ? (schema: JsonSchemaWithRef | undefined) =>
        schema !== undefined ? scanner.scan(schema).getValue() : undefined
    : null;
};

export type ResolveSchema = Fn<
  [schema: JsonSchemaWithRef],
  JsonSchemaWithVirtual | undefined
>;
