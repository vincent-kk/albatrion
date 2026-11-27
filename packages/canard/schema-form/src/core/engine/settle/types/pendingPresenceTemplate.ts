import type { Nullable } from '@aileron/declare';

/** A call-local wildcard reader awaiting its static host's next expansion. */
export interface PendingPresenceTemplate {
  /** Absolute owner template still containing an unbound array wildcard. */
  template: string;
  /** Ancestor reads and direct subtree reads have different exclusion rules. */
  kind: 'outer' | 'direct';
  /** Deepest registering path on one ancestor chain; null for unrelated paths. */
  deepest: Nullable<string>;
  /** Static live host preceding the template's first wildcard. */
  host: string;
  /** Latest change admitted to this pending template, on the settlement clock. */
  stamp: number;
}
