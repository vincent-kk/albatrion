import type { BlueprintChildEntry } from './node';

/** Immutable host evidence; entries borrow the completed graph's ordinary order. */
export interface FixedFirstHostPlan {
  /** Baseline edges; every name has exactly one unconditional identity. */
  readonly entries: readonly BlueprintChildEntry[];
  /** Original entry sites that can select conditional contributions. */
  readonly affected: readonly BlueprintChildEntry[];
}

/** Mount-only shape proof, containing no occurrences, validator or verdict. */
export interface FixedFirstLoadPlan {
  /** Object hosts keyed by immutable template ID; no per-scalar metadata. */
  readonly hosts: Readonly<Record<number, FixedFirstHostPlan>>;
}
