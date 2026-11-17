/** Validated CLI options; checkout paths are resolved by the I/O boundary. */
export interface CoreOptions {
  /** Selected canonical case IDs in execution order. */
  cases: string[];
  /** Positive measured page count per variant. */
  runs: number;
  /** Nonnegative discarded page count per variant. */
  warmup: number;
  /** Directory receiving generated artifacts. */
  out: string;
  /** Local Git ref to install and build in a temporary worktree. */
  baseline?: string;
  /** Existing independently installed and built baseline checkout. */
  baselineDir?: string;
}
