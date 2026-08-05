import type { Destination, OrphanScan } from '../agentTarget/index.js';
import type { Sha256Hex } from '../hash/index.js';

/** What the plan decided to do about one manifest entry. */
export type ActionKind =
  | 'copy'
  | 'skip-uptodate'
  | 'warn-diverged'
  | 'warn-orphan'
  | 'delete'
  | 'skip-unsupported';

/**
 * What the action touches. Orthogonal to `ActionKind`: the same verdict
 * applies whether the content lives in its own file or in a marker block
 * inside a shared document.
 */
export type ActionTarget = Destination;

export interface Action {
  readonly kind: ActionKind;
  /** Manifest path. For an orphan it is reconstructed from what was found. */
  readonly relPath: string;
  readonly target: ActionTarget;
}

export interface InjectPlan {
  readonly actions: readonly Action[];
  /** True when applying would overwrite or drop content the user may own. */
  readonly requiresForce: boolean;
}

export interface PlanInput {
  readonly sourceHashes: Record<string, Sha256Hex>;
  /** From `resolveDestinations`. A path absent here is left untouched. */
  readonly destinations: ReadonlyMap<string, Destination>;
  readonly orphanScans: readonly OrphanScan[];
  readonly force: boolean;
}
