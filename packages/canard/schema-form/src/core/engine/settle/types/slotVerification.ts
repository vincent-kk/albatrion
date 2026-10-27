import type { FieldNodeRecord } from '../../record';

/** Public data captured before an independent baseline commit leaves its entry. */
export interface SlotShadowSnapshot<Self> {
  /** Baseline settlement number at this exact observation point. */
  commit: number;
  /** Runtime diagnostics and ordered error occurrences. */
  runtime: Record<string, unknown>;
  /** Public values, pending events and per-bit revisions for each lifetime. */
  nodes: Map<
    Self,
    {
      values: Record<string, unknown>;
      revisions: readonly (number | undefined)[];
    }
  >;
}

/** Verification-only pairing of independently settled occurrence lifetimes. */
export interface SlotShadowSession<Self extends FieldNodeRecord<Self>> {
  /** Retained-instance tree whose public contract is checked. */
  actual: Self;
  /** Independently computed latent-store baseline. */
  shadow: Self;
  /** Whether an outer operation already owns replay and cleanup. */
  active: boolean;
  /** Actual occurrences paired once, including departed historical references. */
  nodes: Map<Self, Self>;
  /** Reverse occurrence pairing rejects accidental lifetime reuse. */
  reverseNodes: Map<Self, Self>;
  /** Public object identities observed across commits. */
  references: WeakMap<object, object>;
  /** Reverse identity relation prevents collapsed public references. */
  reverseReferences: WeakMap<object, object>;
  /** Last actual commit accepted by the oracle. */
  comparedCommit: number;
  /** Independent observations queued in actual baseline commit order. */
  expectedCommits: SlotShadowSnapshot<Self>[];
  /** Latent operation failure checked after the actual operation settles. */
  replayError?: unknown;
  /** First rejected difference, retained while an entry unwinds. */
  failure?: Error;
}
