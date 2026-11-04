/** Revision base and notification counter owned by one hook subscription. */
export interface ChildErrorStoreState {
  /** Full revision string captured immediately before listener registration. */
  base: string;
  /** Number of qualifying notifications since the current subscription began. */
  version: number;
  /** Whether a listener currently owns the revision base. */
  subscribed: boolean;
}

/** React external-store surface owned by one child-error hook instance. */
export interface ChildErrorStore {
  /** Register one listener and return its complete cleanup. */
  subscribe(listener: () => void): () => void;
  /** Read a current cold vector or the subscribed base/version token. */
  getSnapshot(): string;
}
