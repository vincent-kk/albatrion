/** One materialized item and its blueprint position before path de-duplication. */
export interface InactiveSlotCandidate {
  /** Frozen item shared by unchanged host publications. */
  readonly entry: Readonly<{ path: string; value: unknown }>;
  /** Root-to-occurrence document positions, including concrete array indexes. */
  readonly order: readonly number[];
}
