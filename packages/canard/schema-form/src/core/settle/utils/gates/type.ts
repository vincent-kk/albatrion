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
