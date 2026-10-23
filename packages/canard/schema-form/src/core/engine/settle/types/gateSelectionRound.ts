import type { GateSelectionTable } from './gateSelectionTable';

/** A watched value and registry baseline retained only within one host round. */
export interface GateSelectionValue {
  /** Absolute occurrence-bound watched path. */
  path: string;
  /** Projected value obtained at the original first gate position. */
  value: unknown;
  /** Host occurrence count after locating the first gate; verify only. */
  occurrences: number;
}

/** One host's eligible round, replaced before the next round starts. */
export interface GateSelectionRound {
  /** Current loop counter, scoped to this host invocation. */
  round: number;
  /** Immutable metadata prepared during mount or lazy selection. */
  table: GateSelectionTable;
  /** Group values keyed by baseline name, shared by root and child selection. */
  values: Map<string, GateSelectionValue>;
  /** Escaped watched paths fixed at round entry for the dirty observer. */
  watchedPaths: readonly string[];
  /** Whether dirty marks still belong to this round. */
  active: boolean;
}
