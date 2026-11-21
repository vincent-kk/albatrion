import type { Destination, OrphanScan } from '../agentTarget/index.js';
import type { Sha256Hex } from '../hash/index.js';
import type { SourceSnapshot } from '../types/sourceSnapshot.js';

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

/** Internal evidence for exact-file deletions, excluded from serialized actions. */
export const INSTALLED_HASH = Symbol();

export interface Action {
  /** Physical destination identity; spelling remains in target for diagnostics. */
  readonly destinationKey?: string;
  readonly kind: ActionKind;
  /** Manifest path. For an orphan it is reconstructed from what was found. */
  readonly relPath: string;
  readonly target: ActionTarget;
  /** Source bytes superseded a stale manifest entry for this action. */
  readonly sourceHashReconciled?: boolean;
  /** Actual source bytes used to detect conflicting run-wide destinations. */
  readonly sourceHash?: Sha256Hex;
  /** Previously installed content required by an exact-file orphan deletion. */
  readonly [INSTALLED_HASH]?: Sha256Hex;
}

export interface InjectPlan {
  readonly actions: readonly Action[];
  /** True when applying would overwrite or drop content the user may own. */
  readonly requiresForce: boolean;
}

export interface PlanInput {
  /** Present for built manifests whose selected entries must match current source bytes. */
  readonly assetRoot?: string;
  readonly sourceHashes: Record<string, Sha256Hex>;
  /** Normalized body hashes stored alongside raw manifest hashes. */
  readonly ruleBodyHashes?: Readonly<Record<string, Sha256Hex>>;
  /** Run-owned source snapshots normalized once before all checks and writes. */
  readonly sourceSnapshots?: Map<string, SourceSnapshot | null>;
  /** From `resolveDestinations`. A path absent here is left untouched. */
  readonly destinations: ReadonlyMap<string, Destination>;
  readonly orphanScans: readonly OrphanScan[];
  readonly force: boolean;
}
