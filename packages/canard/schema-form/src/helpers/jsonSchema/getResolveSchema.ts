import type { Fn } from '@aileron/declare';

import type {
  JsonSchema,
  JsonSchemaWithRef,
  JsonSchemaWithVirtual,
} from '@/schema-form/types';

import { getReferenceTable } from './utils/getReferenceTable';
import { getResolveSchemaScanner } from './utils/getResolveSchemaScanner';

/**
 * JSON 스키마에서 $ref 참조를 해석하는 함수를 생성합니다.
 * @param jsonSchema - 원본 JSON 스키마
 * @param maxDepth - 참조 해석 최대 깊이 (기본값: 1)
 * @returns 참조를 해석할 수 있는 함수 또는 null
 */
export const getResolveSchema = (
  jsonSchema: JsonSchema,
  maxDepth: number = 1,
): ResolveSchema | null => {
  const table = getReferenceTable(jsonSchema);
  const scanner = table ? getResolveSchemaScanner(table, maxDepth) : null;
  return scanner
    ? (schema: JsonSchemaWithRef) =>
        scanner.scan(schema).getValue() as JsonSchemaWithVirtual
    : null;
};

export type ResolveSchema = Fn<
  [schema: JsonSchemaWithRef],
  JsonSchemaWithVirtual
>;
