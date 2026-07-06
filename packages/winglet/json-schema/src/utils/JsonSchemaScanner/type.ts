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

/**
 * How a keyword's value maps to child subschemas during traversal.
 *
 * - `schema`     — single subschema (`not`, `if`, `additionalProperties`, …).
 * - `schemaList` — array of subschemas (`allOf`, …); `variant` is the index.
 * - `schemaMap`  — record of subschemas keyed by name (`$defs`, `patternProperties`, …).
 * - `objectMap`  — like `schemaMap` but the key contributes an (escaped) `dataPath` segment (`properties`).
 * - `items`      — tuple (array, each child adds its index to `dataPath`) or single subschema (`items`, `prefixItems`).
 */
export type KeywordKind =
  | 'schema'
  | 'schemaList'
  | 'schemaMap'
  | 'objectMap'
  | 'items';

/** A single entry in the traversal vocabulary: which keyword to descend into and how. */
export interface KeywordDescriptor {
  keyword: string;
  kind: KeywordKind;
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
  /**
   * When `hasReference` is `true`, why the `$ref` was left in place instead of
   * being inlined: `'cycle'` (already being resolved on the current path),
   * `'unresolved'` (resolver returned nothing), or `'definition'` (the node
   * lives under `$defs`/`definitions`, so it is intentionally not resolved).
   */
  referenceSkipped?: 'cycle' | 'unresolved' | 'definition';
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
  /**
   * Whether to deep-clone the schema returned by `resolveReference` before
   * inlining it into the traversal and the processed output.
   *
   * Defaults to `true`. Cloning isolates the resolved subtree so that
   * (1) the original schema passed to `resolveReference` is never mutated,
   * and (2) multiple occurrences of the same `$ref` do not become aliased
   * in the processed output. Set to `false` only when the resolver already
   * returns a freshly-owned object and the extra clone is pure overhead.
   *
   * @remarks
   * Versions before this option existed behaved as if it were `false`: the
   * resolved schema was assigned in place with no clone, so repeated
   * occurrences of the same `$ref` shared one aliased object. The current
   * default (`true`) deep-clones each resolved `$ref` instead; pass `false`
   * to restore the previous aliased behavior.
   */
  cloneResolvedSchema?: boolean;
  /**
   * Whether to memoize `resolveReference` results per reference string.
   *
   * Defaults to `false` (each occurrence invokes the resolver). Enable to
   * avoid redundant resolver calls (e.g. remote fetches) when the same
   * reference appears multiple times. The raw resolver result is cached and
   * cloned at inline time (see `cloneResolvedSchema`) so caching never
   * introduces shared references into the output.
   */
  cacheResolvedReference?: boolean;
  /**
   * Extra applicator keywords to descend into, appended after the built-in
   * vocabulary. Opt-in: descriptors are appended after the built-ins, and the
   * two lists are merged by `keyword`. If a descriptor's `keyword` equals a
   * built-in keyword (e.g. `properties`), the later (consumer) entry
   * overrides the built-in's `kind` and ordering — do NOT reuse a built-in
   * keyword name unless you intend to override it. Use the shared
   * `EXTENDED_KEYWORDS` preset for draft 2019-09 / 2020-12 keywords
   * (`patternProperties`, `propertyNames`, `contains`, `dependentSchemas`,
   * `unevaluatedProperties`, …) or supply your own descriptors (e.g. vendor
   * `x-*` keywords).
   */
  additionalKeywords?: KeywordDescriptor[];
  /** Context object passed to visitors and filters */
  context?: ContextType;
}

export interface JsonScannerOptionsAsync<
  Schema extends UnknownSchema = UnknownSchema,
  ContextType = void,
> extends Omit<
    JsonScannerOptions<Schema, ContextType>,
    'filter' | 'mutate' | 'resolveReference'
  > {
  /** Schema node filtering function (may be async) */
  filter?: Fn<
    [entry: SchemaEntry<Schema>, context?: ContextType],
    boolean | Promise<boolean>
  >;
  /** Function to mutate schema (may be async) */
  mutate?: Fn<
    [entry: SchemaEntry<Schema>, context?: ContextType],
    Schema | void | Promise<Schema | void>
  >;
  /** Function to resolve $ref references (may be async) */
  resolveReference?: Fn<
    [reference: string, entry: SchemaEntry<Schema>, context?: ContextType],
    Schema | Promise<Schema | undefined> | undefined
  >;
}
