import type { BlueprintOptions } from './blueprint';
import type { BlueprintNode } from './node';
import type { BlueprintSchema } from './schema';

/** Effective-schema merge policies, independent of blueprint construction caching. */
export interface EffectiveSchemaOptions {
  /** Static conjunction failures throw; runtime conflicts remain schema data. */
  readonly mode?: EffectiveSchemaMode;
  /** Renderer-supplied opaque-value predicate used by group object merging. */
  readonly isAtomic?: BlueprintOptions['isAtomic'];
  /** Optional collector for path-aware static errors. */
  readonly collect?: BlueprintOptions['collect'];
}

/** Caller-owned effective-schema memo, separated by node and normalized active set. */
export type EffectiveSchemaMemo = WeakMap<
  BlueprintNode,
  EffectiveSchemaCacheEntry[]
>;

/** Immutable merge result: renderer hints plus the signal settlement reads. */
export interface EffectiveSchema {
  /** Frozen hints for this active set; false when a contributing schema forbids every value. */
  readonly schema: BlueprintSchema;
  /** True when the active gated types share nothing with the static accepted set. */
  readonly typeConflict: boolean;
}

/** Separate memo contexts prevent runtime conflicts from bypassing static validation. */
export interface EffectiveSchemaCacheEntry {
  /** Error behavior belonging to this memo context. */
  readonly mode: EffectiveSchemaMode;
  /** Renderer atomicity predicate identity belonging to this context. */
  readonly isAtomic: BlueprintOptions['isAtomic'];
  /** Normalized active declaration sets mapped to immutable result records. */
  readonly schemas: Map<string, EffectiveSchema>;
}

/** Merge mode: `static` rejects empty intersections with a path; `runtime` marks them in the result. */
export type EffectiveSchemaMode = 'static' | 'runtime';
