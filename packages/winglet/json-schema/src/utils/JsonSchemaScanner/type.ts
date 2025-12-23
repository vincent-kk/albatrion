import type { Fn } from '@aileron/declare';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

export const $DEFS = '$defs';
export const DEFINITIONS = 'definitions';
export const PROPERTIES = 'properties';
export const ADDITIONAL_PROPERTIES = 'additionalProperties';
export const ITEMS = 'items';
export const PREFIX_ITEMS = 'prefixItems';

export const CONDITIONAL_KEYWORDS = ['not', 'if', 'then', 'else'] as const;
export const COMPOSITION_KEYWORDS = ['allOf', 'anyOf', 'oneOf'] as const;

export type DefinitionKeyword = typeof $DEFS | typeof DEFINITIONS;
export type ConditionalKeyword = (typeof CONDITIONAL_KEYWORDS)[number];
export type CompositionKeyword = (typeof COMPOSITION_KEYWORDS)[number];

export type PropertiesKeyword = typeof PROPERTIES;
export type AdditionalPropertiesKeyword = typeof ADDITIONAL_PROPERTIES;
export type ItemsKeyword = typeof ITEMS | typeof PREFIX_ITEMS;

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

export type SchemaEntry<Schema extends UnknownSchema = UnknownSchema> = {
  /** The schema node being processed */
  schema: Schema;
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

export interface SchemaVisitor<
  Schema extends UnknownSchema = UnknownSchema,
  ContextType = void,
> {
  /** Callback called when node processing starts */
  enter?: Fn<[entry: SchemaEntry<Schema>, context?: ContextType]>;
  /** Callback called when node processing ends */
  exit?: Fn<[entry: SchemaEntry<Schema>, context?: ContextType]>;
}

export interface JsonScannerOptions<
  Schema extends UnknownSchema = UnknownSchema,
  ContextType = void,
> {
  /** Schema node filtering function */
  filter?: Fn<[entry: SchemaEntry<Schema>, context?: ContextType], boolean>;
  /** Function to mutate schema */
  mutate?: Fn<
    [entry: SchemaEntry<Schema>, context?: ContextType],
    Schema | void
  >;
  /** Function to resolve $ref references */
  resolveReference?: Fn<
    [reference: string, entry: SchemaEntry<Schema>, context?: ContextType],
    Schema | undefined
  >;
  /** Maximum traversal depth */
  maxDepth?: number;
  /** Context object passed to visitors and filters */
  context?: ContextType;
}

export interface JsonScannerOptionsAsync<
  Schema extends UnknownSchema = UnknownSchema,
  ContextType = void,
> extends Omit<JsonScannerOptions<Schema, ContextType>, 'resolveReference'> {
  resolveReference?: Fn<
    [reference: string, entry: SchemaEntry<Schema>, context?: ContextType],
    Schema | Promise<Schema | undefined> | undefined
  >;
}
