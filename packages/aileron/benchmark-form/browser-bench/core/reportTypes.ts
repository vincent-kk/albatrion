/** Distribution of one case's nonnegative millisecond observations. */
export interface CoreStatistics {
  /** Arithmetic median of the observed pages. */
  medianMs: number;
  /** Nearest-rank 95th percentile of the observed pages. */
  p95Ms: number;
}

/** One advisory case result; retry is internal to an unfinished group. */
export interface CoreCaseResult {
  /** Canonical core fixture identifier. */
  id: string;
  /** Workspace observations, in milliseconds per operation or per write. */
  candidate: CoreStatistics;
  /** Prepared baseline observations, when comparing. */
  baseline?: CoreStatistics;
  /** Byte-identical baseline control observations, when comparing. */
  control?: CoreStatistics;
  /** Candidate median minus baseline median. */
  deltaMs?: number;
  /** Minimum absolute median difference that earns a speed verdict. */
  thresholdMs?: number;
  /** Maximum absolute baseline/control median difference. */
  controlBandMs?: number;
  /** First group or its single retry. */
  attempt?: number;
  /** Measurement status; slower/faster never fail the harness. */
  verdict: 'measured' | 'within noise' | 'slower' | 'faster' | 'retry' | 'void';
}

/** Portable summary shared by terminal, artifact and workflow output. */
export interface CoreSummary {
  /** Whether a prepared baseline participated. */
  mode: 'measure' | 'compare';
  /** Measured fresh pages per case and variant. */
  runs: number;
  /** Discarded fresh pages per case and variant. */
  warmup: number;
  /** Results in requested fixture order. */
  cases: CoreCaseResult[];
}
