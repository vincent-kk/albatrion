import type { Fn } from '@aileron/declare';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

export const $DEFS = '$defs';
export const DEFINITIONS = 'definitions';

export const CONDITIONAL_KEYWORDS = ['not', 'if', 'then', 'else'] as const;
export const COMPOSITION_KEYWORDS = ['allOf', 'anyOf', 'oneOf'] as const;

export type DefinitionKeyword = typeof $DEFS | typeof DEFINITIONS;
export type ConditionalKeyword = (typeof CONDITIONAL_KEYWORDS)[number];
export type CompositionKeyword = (typeof COMPOSITION_KEYWORDS)[number];

export type PropertiesKeyword = 'properties';
export type AdditionalPropertiesKeyword = 'additionalProperties';
export type ItemsKeyword = 'items';

export enum OperationPhase {
  /** Phase when first visiting a node */
  Enter = 1 << 0,
  /** Phase for adding child nodes */
  ChildEntries = 1 << 1,
  /** Phase for processing $ref */
  Reference = 1 << 2,
  /** Phase when completing node visit */
  Exit = 1 << 3,
}

export type SchemaEntry = {
  /** The schema node being processed */
  schema: UnknownSchema;
  /** JSON pointer path of the current node */
  path: string;
  /** Data pointer path corresponding to the current node */
  dataPath: string;
  /** Traversal depth */
  depth: number;
  /** Whether there is a reference */
  hasReference?: boolean;
  /** Processed reference path */
  referencePath?: string;
  /** Whether reference is resolved */
  referenceResolved?: boolean;
} & (
  | {
      keyword: CompositionKeyword;
      variant: number;
    }
  | {
      keyword: ItemsKeyword;
      variant?: number;
    }
  | {
      keyword: DefinitionKeyword | PropertiesKeyword;
      variant: string;
    }
  | {
      keyword: ConditionalKeyword | AdditionalPropertiesKeyword;
    }
  | { keyword?: never }
);

export interface SchemaVisitor<ContextType = void> {
  /** Callback called when node processing starts */
  enter?: Fn<[entry: SchemaEntry, context?: ContextType]>;
  /** Callback called when node processing ends */
  exit?: Fn<[entry: SchemaEntry, context?: ContextType]>;
}

export interface JsonScannerOptions<ContextType = void> {
  /** Schema node filtering function */
  filter?: Fn<[entry: SchemaEntry, context?: ContextType], boolean>;
  /** Function to mutate schema */
  mutate?: Fn<
    [entry: SchemaEntry, context?: ContextType],
    UnknownSchema | void
  >;
  /** Function to resolve $ref references */
  resolveReference?: Fn<
    [reference: string, entry: SchemaEntry, context?: ContextType],
    UnknownSchema | undefined
  >;
  /** Maximum traversal depth */
  maxDepth?: number;
  /** Context object passed to visitors and filters */
  context?: ContextType;
}

export interface JsonScannerOptionsAsync<ContextType = void>
  extends JsonScannerOptions<ContextType> {
  resolveReference?: Fn<
    [reference: string, entry: SchemaEntry, context?: ContextType],
    UnknownSchema | Promise<UnknownSchema | undefined> | undefined
  >;
}
