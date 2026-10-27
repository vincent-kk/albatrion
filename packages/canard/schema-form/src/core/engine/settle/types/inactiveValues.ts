import type { BlueprintNode } from '../../blueprint';
import type { FieldNodeRuntime } from '../../record';
import type { PathKeyedMap } from '../../utils/pathIndex/PathKeyedMap';

/** Public immutable projection shared by live and detached reads. */
export type InactiveValues = readonly Readonly<{
  path: string;
  value: unknown;
}>[];
/** Existing selected entry layout retained by the full oracle. */
export type InactiveEntry =
  NonNullable<
    FieldNodeRuntime<unknown>['inactiveValueEntries']
  > extends PathKeyedMap<infer Entry>
    ? Entry
    : never;
/** One changed source captured without retaining its former public node. */
export interface InactiveSource {
  /** Existing encoded pair key. */
  readonly key: string;
  /** Existing absolute path, including deleted occurrences. */
  readonly path: string;
  /** Presence differs from an explicit undefined source. */
  readonly present: boolean;
  /** Frozen raw source or immutable HostLatent channels. */
  readonly source: unknown;
  /** Immutable template used by the source classifier. */
  readonly template: BlueprintNode;
  /** Root-to-occurrence document position. */
  readonly order: readonly number[];
  /** Final committed visibility at source capture. */
  readonly visible: boolean;
}
/** A host's source view and selected items before its array is requested. */
export interface InactiveProjection {
  /** Source candidates within this host's path range. */
  readonly sources: PathKeyedMap<InactiveSource>;
  /** Later presence deltas overriding captured source visibility. */
  readonly visibility: Map<string, boolean>;
  /** Current winning item at each enumerable path. */
  readonly entries: PathKeyedMap<InactiveEntry>;
  /** Last real list-change token for this host. */
  version: object;
  /** Ancestor tokens folded only by the complete root projection. */
  readonly versions?: Map<string, object>;
}
/** Compacted immutable starting point shared by later journal generations. */
export interface InactiveBase {
  /** Frozen sources indexed by occurrence path. */
  readonly sources: PathKeyedMap<InactiveSource>;
  /** Selected items preserve previously published object identities. */
  readonly entries: PathKeyedMap<InactiveEntry>;
  /** Last actual list change for each affected ancestor path. */
  readonly versions: ReadonlyMap<string, object>;
}
/** Immutable commit facts plus equivalent memoizations filled only on read. */
export interface InactiveGeneration {
  /** Earlier immutable facts, absent after bounded compaction. */
  readonly parent?: InactiveGeneration;
  /** Shared compacted sources and entry identities. */
  readonly base: InactiveBase;
  /** Committed existing-key changes; no public list arrays. */
  readonly changes: ReadonlyMap<string, InactiveSource>;
  /** Final presence changes for entered and exited paths. */
  readonly visibility: ReadonlyMap<string, boolean>;
  /** Host views filled on demand without changing generation facts. */
  readonly projections: Map<string, InactiveProjection>;
  /** Resolved host versions permit constant-time repeated reads without source views. */
  readonly readVersions: Map<string, object>;
  /** Item identities shared by overlapping host views of this generation. */
  readonly items: Map<string, InactiveEntry>;
  /** Equivalent list-version tokens shared by overlapping views. */
  readonly versions: Map<string, object>;
}
