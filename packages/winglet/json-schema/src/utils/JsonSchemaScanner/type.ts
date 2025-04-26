import type { Fn } from '@aileron/declare';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

export const COMPOSITION_KEYWORDS = ['allOf', 'anyOf', 'oneOf'] as const;
export const CONDITIONAL_KEYWORDS = ['not', 'if', 'then', 'else'] as const;

export interface SchemaEntry {
  schema: UnknownSchema;
  path: string;
  depth: number;
  hasReference?: boolean;
  referencePath?: string;
  resolvedReference?: boolean;
}

export interface SchemaVisitor<ContextType = void> {
  enter?: Fn<[entry: SchemaEntry, context: ContextType | undefined]>;
  exit?: Fn<[entry: SchemaEntry, context: ContextType | undefined]>;
}

export interface JsonScannerOptions<ContextType = void> {
  maxDepth?: number;
  filter?: Fn<[entry: SchemaEntry, context: ContextType | undefined], boolean>;
  resolveReference?: Fn<
    [reference: string, context: ContextType | undefined],
    UnknownSchema | undefined
  >;
  context?: ContextType;
}

export interface JsonScannerOptionsAsync<ContextType = void>
  extends JsonScannerOptions<ContextType> {
  resolveReference?: Fn<
    [reference: string, context: ContextType | undefined],
    UnknownSchema | Promise<UnknownSchema | undefined> | undefined
  >;
}
