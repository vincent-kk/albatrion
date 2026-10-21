/** A call-local wildcard reader awaiting its static host's next expansion. */
export interface PendingPresenceTemplate {
  /** Absolute owner template still containing an unbound array wildcard. */
  template: string;
  /** Ancestor reads and direct subtree reads have different exclusion rules. */
  kind: 'outer' | 'direct';
  /** Deepest registering path on one ancestor chain; null for unrelated paths. */
  deepest: string | null;
  /** Static live host preceding the template's first wildcard. */
  host: string;
}
