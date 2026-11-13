import type { Fn } from '@aileron/declare';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type { Dialect, SchemaEntry } from '../../type';
import type { OutputOperation } from '../output/type';
import type { KeywordMap } from '../vocabulary/type';

/** An active Brent checkpoint; frame index identifies its owner without inspecting public entry metadata on exit. */
export interface PhysicalCheckpoint {
  /** Logical schema depth at capture, always a power of two at least 256. */
  depth: number;
  /** Ancestor schema identity compared with deeper object nodes. */
  schema: object;
  /** Owner's stable position in the engine's frame arrays. */
  frame: number;
}

/** Callback snapshot and output ledger shared by both drivers for one scan. */
export interface ScanConfig<
  Schema extends UnknownSchema = UnknownSchema,
  ContextType = void,
> {
  /** Caller-owned context passed to every callback. */
  context: ContextType | undefined;
  /** Inclusive traversal depth bound; reference resolution still runs at the boundary. */
  maxDepth: number | undefined;
  /** Whether each resolved occurrence receives its own cloned target. */
  cloneResolvedSchema: boolean;
  /** Whether resolver results, including undefined, are memoized by reference string. */
  cacheResolvedReference: boolean;
  /** Root fallback when no known resource metaschema is declared. */
  defaultDialect?: Dialect;
  /** Ordered vocabulary assembled by the driver before traversal. */
  keywordMap: KeywordMap;
  /** Driver-owned mutations and inlined references, applied by getValue. */
  operations: OutputOperation[];
  /** Reject a node and all its descendants before any other callbacks. */
  filter?: Fn<[entry: SchemaEntry<Schema>, context?: ContextType], unknown>;
  /** Replace a node before entry and record any non-undefined result. */
  mutate?: Fn<[entry: SchemaEntry<Schema>, context?: ContextType], unknown>;
  /** Visit the node before resolving references and capturing children. */
  enter?: Fn<[entry: SchemaEntry<Schema>, context?: ContextType], unknown>;
  /** Visit the same entry after all captured descendants complete. */
  exit?: Fn<[entry: SchemaEntry<Schema>, context?: ContextType], unknown>;
  /** Supply a reference target; definitions and active reference strings skip this callback. */
  resolveReference?: Fn<
    [reference: string, entry: SchemaEntry<Schema>, context?: ContextType],
    unknown
  >;
}

/** Engine-owned mutable view; callbacks receive the read-only schema property through SchemaEntry. */
export type EngineEntry<Schema extends UnknownSchema = UnknownSchema> = Omit<
  SchemaEntry<Schema>,
  'schema'
> & {
  schema: Schema | boolean;
};

/** Resource dialect restored when its owner frame exits; allocated only for a known dialect change. */
export interface DialectScope {
  /** Stable owner frame index. */
  frame: number;
  /** Enclosing resource's dialect bit. */
  previous: number;
}
