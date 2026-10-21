/** A maximal owner-rank interval with no owner outside this host between members. */
export interface SplitRun {
  /** Host-wide run number keeps same-epoch buckets' anchor keys distinct. */
  readonly id?: number;
  /** Member ranks in the original owners array, in increasing order. */
  readonly ranks: readonly number[];
  /** First member rank, used to merge run work with ordinary owners. */
  readonly firstRank: number;
}

/** Immutable table-owner subset belonging to one watched trie node and host. */
export interface SplitBucket {
  /** Absolute, wildcard-free table host path. */
  readonly hostPath: string;
  /** Original owners-array rank of the first split member. */
  readonly firstRank: number;
  /** Authored child names to original owner ranks. */
  readonly ranksByName: ReadonlyMap<string, number>;
  /** Static intervals computed once with the dependency trie. */
  readonly runs: readonly SplitRun[];
  /** Authored child name to its static run number. */
  readonly runByName: ReadonlyMap<string, number>;
}

/** Shared immutable lookup used by deletion without enumerating dormant members. */
export interface SplitOwner {
  /** Owning watch-node bucket. */
  readonly bucket: SplitBucket;
  /** Original rank in that node's owners. */
  readonly rank: number;
  /** Static run index within the bucket. */
  readonly run: number;
}

/** Deferred index insertion, merged at the first newly represented member's rank. */
export interface SplitAnchorEvent {
  /** Original owner rank where this anchor replaces the first absent key. */
  readonly rank: number;
  /** Insert only when rank-ordered emission reaches this event. */
  readonly insert: () => void;
}

/** Registration effects supplied by the settlement, independent of trie traversal. */
export interface RegistrationSink {
  /** Register one deduplicated concrete owner or table host in original order. */
  owner(
    path: string,
    kind: 'plain' | 'host' | 'split',
    bucket?: SplitBucket,
  ): void;
  /** Record a bucket hit and plan its anchors before ordered emission. */
  hit(
    bucket: SplitBucket,
    liveRanks: readonly number[],
  ): readonly SplitAnchorEvent[];
}
