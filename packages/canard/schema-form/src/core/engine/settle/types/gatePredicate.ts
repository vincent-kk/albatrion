import type { GateWheelInput } from './gateWheel';

/** Complete positional inputs passed to a bound pure predicate. */
export interface GatePredicateInputs {
  /** Values in the predicate's declared read order. */
  values: unknown[];
  /** Current complete host view for opaque validator execution. */
  view?: Record<string, unknown>;
}

/** One occurrence's evaluator and complete read evidence; never a public API. */
export interface GatePredicate {
  /** Absolute paths used by host invalidation and input identity comparisons. */
  readonly reads: readonly string[];
  /** Narrow if property names; undefined denotes a whole-host validator read. */
  readonly names?: readonly string[];
  /** Stable witness metadata; values are supplied at evaluation time. */
  readonly inputs: readonly Omit<GateWheelInput, 'value'>[];
  /** Whether input equality proves that reusing the last result is valid. */
  readonly memoizable: boolean;
  /** Execute the expression, strict tag predicate, or lazily bound validator. */
  readonly evaluate: (inputs: GatePredicateInputs) => boolean | undefined;
}

/** Last successful predicate result, owned by one registered occurrence. */
export interface GatePredicateMemo {
  /** Exact primitive or projected-reference inputs of that successful execution. */
  readonly values: readonly unknown[];
  /** Boolean outcome; throws and missing validators never populate this slot. */
  readonly value: boolean;
}
