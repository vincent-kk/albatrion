import type { Optional } from '@aileron/declare';

import type { BlueprintChildEntry } from '../../blueprint';

/** Last materialized item, shared only while its inactive lifetime continues. */
export interface InactiveSlotValueMemo {
  /** Absolute published path, which may differ from a retained reference's path. */
  readonly path: string;
  /** Interpreted source used by this item. */
  readonly value: unknown;
  /** Frozen public item retained across unchanged reads. */
  readonly entry: Readonly<{ path: string; value: unknown }>;
}

/** Source-channel patch owned by a host rather than its detached instance. */
export interface InactiveSlotOverlay {
  /** Discard unspecified channels and descendants instead of inheriting them. */
  readonly replace?: boolean;
  /** An own property distinguishes an explicit clear from no raw override. */
  readonly raw?: unknown;
  /** An own property distinguishes cleared extras from inherited extras. */
  readonly undeclaredValues?: unknown;
  /** Candidate-specific descendant patches in their authored bindings. */
  readonly children?: ReadonlyMap<BlueprintChildEntry, InactiveSlotOverlay>;
  /** Array positions retained even when no declared item has a source. */
  readonly itemCount?: number;
  /** Descendant input patches belong only to the packed array's own value. */
  readonly packedArrayInput?: boolean;
  /** Last published item; allocated only by an inactive-value read. */
  valueMemo?: InactiveSlotValueMemo;
}

/** Previously published source held until pending writes reach a commit. */
export interface InactiveSlotBaseline<Self> {
  /** Previously active child whose own inactive descendants were already published. */
  readonly active?: Self;
  /** Instance visible to the preceding inactive-value publication. */
  readonly source: Optional<Self>;
  /** Patch visible before the first unpublished mutation of this binding. */
  readonly overlay: Optional<InactiveSlotOverlay>;
}
