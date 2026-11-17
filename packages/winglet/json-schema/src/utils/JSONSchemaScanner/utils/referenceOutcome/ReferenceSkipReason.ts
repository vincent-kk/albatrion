/** Every reason a reference stays in the output; reported on `entry.references[].skipped`. */
export const ReferenceSkipReason = {
  /** The reference sits in a definition container or below one; definitions stay address stores. */
  Definition: 'definition',
  /** The canonical target is already being expanded on the ancestor path. */
  Cycle: 'cycle',
  /** No resolver is configured, or the address or document is unavailable. */
  Unresolved: 'unresolved',
  /** The lookup needs a dynamic or recursive anchor rather than static binding. */
  Dynamic: 'dynamic',
  /** Moving the target cannot guarantee equivalent meaning and existing addresses. */
  Relocation: 'relocation',
  /** The target or composition position cannot be inlined. */
  Invalid: 'invalid',
} as const;

/** Union of the reasons a reference can stay in the output. */
export type ReferenceSkipReason =
  (typeof ReferenceSkipReason)[keyof typeof ReferenceSkipReason];
