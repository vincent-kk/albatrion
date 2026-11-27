/** Progress through grow-only presence evidence at one evaluation location. */
export interface PresenceQueryCursor {
  /** First changed path not yet compared with this location's watches. */
  changed: number;
  /** First changed ancestor not yet compared with exact watched paths. */
  prefixes: number;
  /** First watched-path record not yet compared with accumulated changes. */
  index: number;
  /** Watch-record generation; a different generation restarts the watch walk. */
  epoch?: number;
}
