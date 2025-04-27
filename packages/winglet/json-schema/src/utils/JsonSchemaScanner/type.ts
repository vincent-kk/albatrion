import type { Fn } from '@aileron/declare';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

export enum OperationPhase {
  Enter = 1 << 0,
  ChildEntries = 1 << 1,
  Reference = 1 << 2,
  Exit = 1 << 3,
}

export const $DEFS = '$defs';

export interface SchemaEntry {
  schema: UnknownSchema;
  path: string;
  depth: number;
  hasReference?: boolean;
  referencePath?: string;
  referenceResolved?: boolean;
}

export interface SchemaVisitor<ContextType = void> {
  enter?: Fn<[entry: SchemaEntry, context?: ContextType]>;
  exit?: Fn<[entry: SchemaEntry, context?: ContextType]>;
}

export interface JsonScannerOptions<ContextType = void> {
  filter?: Fn<[entry: SchemaEntry, context?: ContextType], boolean>;
  resolveReference?: Fn<
    [reference: string, context?: ContextType],
    UnknownSchema | undefined
  >;
  maxDepth?: number;
  context?: ContextType;
}

export interface JsonScannerOptionsAsync<ContextType = void>
  extends JsonScannerOptions<ContextType> {
  resolveReference?: Fn<
    [reference: string, context?: ContextType],
    UnknownSchema | Promise<UnknownSchema | undefined> | undefined
  >;
}
