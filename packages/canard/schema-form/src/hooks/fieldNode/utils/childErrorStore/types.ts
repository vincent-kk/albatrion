import type { Fn } from '@aileron/declare';

/** Revision base and notification counter owned by one hook subscription. */
export interface ChildErrorStoreState {
  /** Revision vector establishing the current notification token. */
  base: string;
  /** Number of qualifying notifications since the base was established. */
  version: number;
  /** Whether a listener currently owns the revision base. */
  subscribed: boolean;
  /** Last close's current vector; absence distinguishes a new store from a reconnect. */
  closedRevision?: string;
}

/** React external-store surface owned by one child-error hook instance. */
export interface ChildErrorStore {
  /** Register one listener and return its complete cleanup. */
  subscribe(listener: Fn): Fn;
  /** Read the live token, retaining it while a cold vector is unchanged. */
  getSnapshot(): string;
}
