/** Optional deep-merge policies; omitted fields retain the default behavior. */
export interface MergeOptions {
  /** Replace arrays as a whole instead of recursively merging their indices. */
  readonly arrayStrategy?: 'merge' | 'replace';
  /** Treat matching values as opaque leaves whose later declaration wins. */
  readonly isAtomic?: (value: unknown) => boolean;
  /** Retain a one-sided object's identity instead of recursively copying it. */
  readonly preserveReferences?: boolean;
  /** Copy overlapping containers instead of mutating the target. */
  readonly immutable?: boolean;
}
