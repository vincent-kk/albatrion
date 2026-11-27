import type { Fn } from '@aileron/declare';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type { Dialect, KeywordDescriptor } from '../../../keyword';
import type { ReferenceSkipReason } from './referenceOutcome/ReferenceSkipReason';

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
  /** Outcomes for each reference keyword and replacement-chain step handled at this position. */
  references?: ReferenceOutcome[];
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
  /** Context-aware provider of targets valid at the current host position. */
  resolveReference?: ReferenceResolver<any>;
  /** Missing targets remain by default; throw fails the entire scan instead. */
  unresolvedReference?: 'keep' | 'throw';
  /** Limits on replacement-chain length and total inlined schema nodes. */
  limits?: { referenceChain?: number; inlinedNodes?: number };
  /** Inclusive maximum traversal depth, independent of template preparation. */
  maxDepth?: number;
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
  /** Context-aware provider whose resolve operation alone may suspend. */
  resolveReference?: ReferenceResolverAsync<any>;
}

/** Reference applicators selected by the enclosing resource dialect. */
export type ReferenceKeyword = '$ref' | '$dynamicRef' | '$recursiveRef';
export type { ReferenceSkipReason };
/** A resolver supplies a host-valid target or a supported preservation reason. */
export type ReferenceStep =
  | { status: 'resolved'; uri: string; target: UnknownSchema | boolean }
  | {
      status: 'skipped';
      uri?: string;
      reason: Exclude<ReferenceSkipReason, 'definition' | 'cycle'>;
    };
/** Observable result for an original reference or one replacement-chain step. */
export interface ReferenceOutcome {
  /** Reference keyword in the effective dialect. */
  keyword: ReferenceKeyword;
  /** Written value before canonicalization. */
  reference: string;
  /** Canonical target location when the provider knows it. */
  uri?: string;
  /** Whether a target was inlined at this step. */
  resolved: boolean;
  /** Why a reference remains instead of being inlined. */
  skipped?: ReferenceSkipReason;
}
/** Lexical resource context and host-valid synchronous target protocol. */
export interface ReferenceResolver<Context = unknown> {
  /** Establish the document-root context without entering its identifier twice. */
  root(schema: UnknownSchema | boolean): Context;
  /** Enter an original lexical child; absent means the root context is fixed. */
  child?(
    parent: Context,
    keyword: string,
    schema: UnknownSchema | boolean,
  ): Context;
  /** Return the effective dialect for a context. */
  dialect(context: Context): Dialect;
  /** Resolve a written reference and return a target whose meaning already fits the host. */
  resolve(
    reference: string,
    keyword: ReferenceKeyword,
    context: Context,
  ): ReferenceStep;
}
/** Async protocol changes only resolve; root, child and dialect stay synchronous. */
export interface ReferenceResolverAsync<Context = unknown>
  extends Omit<ReferenceResolver<Context>, 'resolve'> {
  /** Resolve using caller-controlled asynchronous document loading if needed. */
  resolve(
    reference: string,
    keyword: ReferenceKeyword,
    context: Context,
  ): ReferenceStep | PromiseLike<ReferenceStep>;
}
