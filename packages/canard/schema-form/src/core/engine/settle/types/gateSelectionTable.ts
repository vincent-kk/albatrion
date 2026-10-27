import type { BlueprintExpression, BlueprintGate } from '../../blueprint';
import type { getDirectChildSelectionPlan } from '../utils/compute/childSelection/getDirectChildSelectionPlan';

/** Primitive type inherited from blueprint evidence without widening its barrel. */
export type GateSelectionLiteral = NonNullable<
  BlueprintExpression['equality']
>['literals'][number];

/** Static steps sharing one ungated terminal watched entry. */
export interface GateSelectionGroup {
  /** Authored baseline entry name used to bind the watched path. */
  readonly watchedName: string;
  /** First table gate, retained for occurrence-relative path binding. */
  readonly firstGate: BlueprintGate;
  /** Original position at which a non-root host first reads this group. */
  readonly firstStepIndex: number;
  /** Literal to every matching step, in ascending authored order. */
  readonly buckets: ReadonlyMap<GateSelectionLiteral, readonly number[]>;
  /** Per-gate comparison evidence reserved for positional verification. */
  readonly literalsByGate: ReadonlyMap<
    BlueprintGate,
    ReadonlySet<GateSelectionLiteral>
  >;
}

/** Root declaration selection for one watched baseline entry. */
export interface RootGateSelectionGroup {
  /** Baseline name whose value selects these declarations. */
  readonly watchedName: string;
  /** Representative gate for occurrence-relative dependency binding. */
  readonly firstGate: BlueprintGate;
  /** Literal to declaration indices, each in ascending authored order. */
  readonly buckets: ReadonlyMap<GateSelectionLiteral, readonly number[]>;
}

/** Cached static metadata; no runtime values or selection results are retained. */
export interface GateSelectionTable {
  /** Non-literal pure gates whose complete reads are stable baseline terminals. */
  readonly predicateGroups: readonly {
    /** Occurrence-bound gate evaluated once before its selected steps apply. */
    readonly gate: BlueprintGate;
    /** Candidate indices admitted together by this predicate. */
    readonly steps: readonly number[];
    /** Baseline names whose values and presence fully determine this predicate. */
    readonly watchedNames: readonly string[];
  }[];
  /** Existing direct-plan eligibility and evaluation order. */
  readonly plan: NonNullable<ReturnType<typeof getDirectChildSelectionPlan>>;
  /** Watched-key groups in first-step order. */
  readonly groups: readonly GateSelectionGroup[];
  /** Baseline and unsupported gate positions in ascending order. */
  readonly alwaysSteps: readonly number[];
  /** Unique candidate name to its authored step. */
  readonly stepIndexByName: ReadonlyMap<string, number>;
  /** Indexed steps for repeated verification and selection membership tests. */
  readonly tableSteps: ReadonlySet<number>;
  /** Present only for the owning root with every gated declaration covered (E5). */
  readonly root?: {
    /** Root declarations admitted without evaluating a gate. */
    readonly ungatedIndices: readonly number[];
    /** Independent watched-key buckets, preserving cross-key OR semantics. */
    readonly groups: readonly RootGateSelectionGroup[];
  };
}
