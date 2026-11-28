import type { BlueprintGate } from '../../../blueprint';

/** One live occurrence's gate host and memoized evaluation location. */
export interface GateOccurrence {
  /** Reusable blueprint gate descriptor. */
  gate: BlueprintGate;
  /** Absolute declaring host for this live occurrence. */
  hostPath: string;
  /** Lowest common ancestor of this host and its expression reads. */
  evaluationHostPath: string;
}

/** A consumer a flipped decision reschedules. */
export interface DecisionConsumer {
  /** Live consumer path. */
  readonly path: string;
  /**
   * True when the consumer is an array item that composes its own schema from the decision;
   * false when the consumer is a branch that reselects its children.
   */
  readonly isOwnSchema: boolean;
}
