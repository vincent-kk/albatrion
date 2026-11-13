import type { Fn } from '@aileron/declare';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

/** JSON Schema dialect used to recognize schema positions inside each resource. */
export type Dialect =
  | 'draft-04'
  | 'draft-06'
  | 'draft-07'
  | '2019-09'
  | '2020-12';

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
  /** Accepted schema-position dialects; omission accepts every supported dialect. */
  dialects?: readonly Dialect[];
}

export type SchemaEntry<Schema extends UnknownSchema = UnknownSchema> = {
  /** The schema node being processed */
  readonly schema: Schema | boolean;
  /** Union-vocabulary position that is not a schema in the enclosing dialect. */
  inert?: boolean;
  /** Applicator name; custom vocabulary names are preserved without narrowing. */
  keyword?: string;
  /** Original map key or list index, independent of the applicator name. */
  variant?: string | number;
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
};

export interface SchemaVisitor<
  Schema extends UnknownSchema = UnknownSchema,
  ContextType = void,
> {
  /** Callback called when node processing starts */
  enter?: Fn<[entry: SchemaEntry<Schema>, context?: ContextType]>;
  /** Callback called when node processing ends */
  exit?: Fn<[entry: SchemaEntry<Schema>, context?: ContextType]>;
}

export interface JSONScannerOptions<
  Schema extends UnknownSchema = UnknownSchema,
  ContextType = void,
> {
  /** Schema node filtering function */
  filter?: Fn<[entry: SchemaEntry<Schema>, context?: ContextType], boolean>;
  /** Function to mutate schema */
  mutate?: Fn<
    [entry: SchemaEntry<Schema>, context?: ContextType],
    Schema | boolean | void
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
  /** Dialect used when the document root has no known $schema; defaults to 2020-12. */
  defaultDialect?: Dialect;
  /** Ordered vocabulary replacing the complete built-in vocabulary. */
  keywords?: readonly KeywordDescriptor[];
  /** Descriptors appended to the selected vocabulary; the last duplicate wins. */
  additionalKeywords?: readonly KeywordDescriptor[];
  /** Context object passed to visitors and filters */
  context?: ContextType;
}

export interface JSONScannerOptionsAsync<
  Schema extends UnknownSchema = UnknownSchema,
  ContextType = void,
> extends Omit<
    JSONScannerOptions<Schema, ContextType>,
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
    Schema | boolean | void | Promise<Schema | boolean | void>
  >;
  /** Function to resolve $ref references (may be async) */
  resolveReference?: Fn<
    [reference: string, entry: SchemaEntry<Schema>, context?: ContextType],
    Schema | Promise<Schema | undefined> | undefined
  >;
}
