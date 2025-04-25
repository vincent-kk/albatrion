import type { Fn } from '@aileron/declare';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

export const COMPOSITION_KEYWORDS = ['allOf', 'anyOf', 'oneOf'] as const;
export const CONDITIONAL_KEYWORDS = ['not', 'if', 'then', 'else'] as const;

export interface SchemaVisitor<ContextType = void> {
  enter?: Fn<
    [schema: UnknownSchema, path: string, depth: number, context: ContextType]
  >;
  exit?: Fn<
    [schema: UnknownSchema, path: string, depth: number, context: ContextType]
  >;
}

export interface JsonScannerOptions<ContextType = void> {
  maxDepth?: number;
  filter?: Fn<
    [schema: UnknownSchema, path: string, depth: number, context: ContextType],
    boolean
  >;
  resolveReference?: Fn<
    [reference: string, context: ContextType],
    UnknownSchema | undefined
  >;
  context?: ContextType;
}

export interface JsonScannerOptionsAsync<ContextType = void>
  extends JsonScannerOptions<ContextType> {
  resolveReference?: Fn<
    [reference: string, context: ContextType],
    UnknownSchema | Promise<UnknownSchema | undefined> | undefined
  >;
}
