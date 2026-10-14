import type { FieldNodeRecord } from '../../record';

/** Tree and edge baselines supplied by settle without a reverse dependency. */
export interface DeriveState<Self extends FieldNodeRecord<Self>> {
  /** Active root whose output supplies all dependency reads. */
  readonly root: Self;
  /** Current gate selections for this complete shape. */
  readonly selectedDeclarationIds: ReadonlyMap<Self, readonly number[]>;
  /** Last committed values for rules in the previous shape. */
  readonly committedRuleValues: ReadonlyMap<string, unknown>;
  /** Values already consumed during this synchronous settlement. */
  readonly consumedRuleValues: Map<string, unknown>;
  /** Final live rule keys from this round, used to prune exited occurrences. */
  readonly activeRuleKeys: Set<string>;
  /** Active keys grouped by source path for bounded re-evaluation. */
  readonly activeRuleKeysBySource: Map<string, Set<string>>;
  /** Live targets whose true unset rule prevents transition fill. */
  readonly activeUnsetTargets: Set<Self>;
  /** Highest kind rank already applied to each target in this settlement. */
  readonly appliedRanks: Map<string, number>;
  /** Source paths affected by a non-load write; absent for a load scan. */
  sourcePaths?: ReadonlySet<string>;
  /** Sources examined during this settlement, including later rounds. */
  readonly visitedSourcePaths: Set<string>;
  /** Source subtree whose load resets rule baselines. */
  readonly loadScope?: Self;
  /** Nodes newly created or explicitly reloaded during this settlement. */
  readonly entered: ReadonlySet<Self>;
  /** Existing occurrences restored after a temporary exit in this settlement. */
  readonly revived: ReadonlySet<Self>;
  /** Whether this call inhibits automatic writes. */
  readonly suppressAutomaticWrites: boolean;
  /** Whether development trace entries should be allocated. */
  readonly trace: boolean;
}
