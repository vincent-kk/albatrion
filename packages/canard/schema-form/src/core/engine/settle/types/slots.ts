import type { BlueprintChildEntry } from '../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../record';

/** Call-local source bindings used only when retaining a clearing array exit. */
export interface CompactedSlotSources<Self extends FieldNodeRecord<Self>> {
  /** Number of surviving item positions, shared by all candidates at each position. */
  readonly itemCount: number;
  /** Correct original source for every newly bound item candidate. */
  readonly sources: ReadonlyMap<BlueprintChildEntry, Self>;
  /** Complete kept channels at those same new bindings. */
  readonly overlays: ReadonlyMap<BlueprintChildEntry, InactiveSlotOverlay>;
  /** Original item sources that do not survive; their detached writes have no destination. */
}

/** One materialized item and its blueprint position before path de-duplication. */
export interface InactiveSlotCandidate {
  /** Frozen item shared by unchanged host publications. */
  readonly entry: Readonly<{ path: string; value: unknown }>;
  /** Root-to-occurrence document positions, including concrete array indexes. */
  readonly order: readonly number[];
}
