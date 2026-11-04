/** Distribution of one case's nonnegative millisecond observations. */
export interface CoreStatistics {
  /** Arithmetic median of the observed pages. */
  medianMs: number;
  /** Nearest-rank 95th percentile of the observed pages. */
  p95Ms: number;
  /** Largest observed page. */
  maxMs: number;
  /** Observed page count. */
  samples: number;
}

/** Per-sample metrics that receive their own comparison beside durationMs. */
export type CoreMetricName =
  | 'durationMs'
  | 'blockingMs'
  | 'maxLongTaskMs'
  | 'longTaskOverlapMs'
  | 'preFrameValidatorMs'
  | 'postFrameValidatorMs'
  | 'validatorSettledMs'
  | 'feedbackCommittedMs'
  | 'validationReportedMs'
  | 'longestFrameMs'
  | 'frameOverflowMs';

/**
 * Distribution of one metric over a variant's samples.
 * numeric: every sample numeric. below-threshold: every sample null (Long Task "< 50 ms").
 * mixed: some samples null; median is taken over all samples with null ordered below every number,
 * so it is a number, "<50" for Long Task metrics, or null for other metrics whose median sample is unobserved.
 * not-observable: the metric does not apply to this operation.
 */
export type CoreMetricStatistics =
  | {
      kind: 'numeric';
      medianMs: number;
      p95Ms: number;
      maxMs: number;
      samples: number;
    }
  | { kind: 'below-threshold'; samples: number }
  | {
      kind: 'mixed';
      samples: number;
      observed: number;
      median: number | '<50' | null;
      maxMs: number;
    }
  | { kind: 'not-observable' };

/** Advisory status of one metric comparison. */
export type CoreMetricVerdict =
  | 'measured'
  | 'within noise'
  | 'slower'
  | 'faster'
  | 'void'
  | 'not observable'
  | 'below threshold';

/** One metric's statistics per variant with its advisory comparison. */
export interface CoreMetricComparison {
  /** Workspace observations. */
  candidate: CoreMetricStatistics;
  /** Prepared baseline observations, when comparing. */
  baseline?: CoreMetricStatistics;
  /** Byte-identical baseline control observations, when comparing. */
  control?: CoreMetricStatistics;
  /** Candidate median minus baseline median; null when either median is unavailable. */
  deltaMs?: number | null;
  /** deltaMs over the baseline median in percent; null when the baseline median is 0 or unavailable. */
  deltaPercent?: number | null;
  /** Candidate median over baseline median; null when the baseline median is 0 or unavailable. */
  ratio?: number | null;
  /** Minimum absolute median difference that earns a speed verdict. */
  thresholdMs?: number;
  /** Maximum absolute baseline/control median difference before the metric is void. */
  controlBandMs?: number;
  /** Advisory status; slower/faster never fail the harness. */
  verdict: CoreMetricVerdict;
}

/** Frame budget of the blocking median; null = N/A (mount and rebuild have no sub-50 ms measure). */
export type CoreFrameBudget = {
  /** Blocking median divided by the 16.7 ms frame. */
  frames: number;
  /** Blocking median above the frame, floored at 0. */
  overflowMs: number;
  /** Whether the blocking median exceeds one frame. */
  overBudget: boolean;
} | null;

/** RAIL-style grade; n/a when the grading input is not observable. */
export type CoreUxGrade = 'ok' | 'perceptible' | 'janky' | 'n/a';

/** Blocking and feedback grades of one variant. */
export interface CoreUxVerdict {
  /** Input-handling grade from blockingMs (typing, first-key) or maxLongTaskMs (mount, rebuild). */
  blocking: CoreUxGrade;
  /** Visible-feedback grade from feedbackCommittedMs. */
  feedback: CoreUxGrade;
}

/** Per-write distribution pooled over a variant's typing samples. */
export interface CoreTypingDistribution {
  /** Pooled typing samples. */
  samples: number;
  /** Largest single-write handler duration. */
  handlerMaxMs: number;
  /** Nearest-rank p95 of single-write handler durations. */
  handlerP95Ms: number;
  /** Writes whose handler exceeded the 16.7 ms frame. */
  overBudgetWrites: number;
  /** Median of write 1's handler duration across samples. */
  firstWriteMedianMs: number;
  /** Largest exact feedback latency; null without exact writes. */
  feedbackMaxMs: number | null;
  /** Totals of the four feedback classes over all writes. */
  classes: {
    exact: number;
    censored: number;
    noChange: number;
    superseded: number;
  };
  /** Exact writes among writes 2–20 (the repeat cost rows). */
  repeatExact: number;
  /** Writes served by a run that started after a later write. */
  coalescedWrites: number;
}

/** Elapsed-time decision; retry is internal to an unfinished group. */
export interface CoreDurationResult {
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

/** One advisory case result with the per-metric, budget, typing and UX views. */
export interface CoreCaseResult extends CoreDurationResult {
  /** Every metric's statistics and comparison, durationMs included. */
  metrics: Record<CoreMetricName, CoreMetricComparison>;
  /** Frame budget of the blocking median per variant; null = N/A. */
  budget: { candidate: CoreFrameBudget; baseline?: CoreFrameBudget };
  /** Per-write distributions for typing cases. */
  typing?: {
    candidate: CoreTypingDistribution;
    baseline?: CoreTypingDistribution;
  };
  /** UX grades per variant. */
  ux: { candidate: CoreUxVerdict; baseline?: CoreUxVerdict };
}

/** One case's contribution to a weighted exchange. */
export interface CoreWeightedRow {
  /** Canonical core fixture identifier. */
  id: string;
  /** Relative events per session. */
  weight: number;
  /** Events per sample; the per-event delta divides by it. */
  k: number;
  /** Stated reason for the weight. */
  basis: string;
  /** Baseline median in microseconds; null when unavailable. */
  baselineMicros: number | null;
  /** Candidate median in microseconds; null when unavailable. */
  candidateMicros: number | null;
  /** Candidate minus baseline per event in microseconds; null when unavailable. */
  deltaMicros: number | null;
  /** Whether the delta enters the exchange (verdicts outside noise only). */
  counted: boolean;
  /** Why the row is not counted. */
  reason?: string;
  /** weight × deltaMicros / k when counted, else 0. */
  contributionMicros: number;
}

/** Owner-rule exchange of one metric over the weighted cases. */
export interface CoreWeightedExchange {
  /** Metric whose medians are exchanged. */
  metric: CoreMetricName;
  /** One row per weighted case. */
  rows: CoreWeightedRow[];
  /** Sum of counted contributions; negative is an improvement. */
  exchangeMicros: number;
  /** Σ weight × baseline median over rows with both medians. */
  weightedBaselineMicros: number;
  /** Σ weight × candidate median over rows with both medians. */
  weightedCandidateMicros: number;
  /** weightedCandidateMicros / weightedBaselineMicros; null when the baseline sum is 0. */
  weightedRatio: number | null;
  /** Rows excluded from both sums, as "id: reason". */
  excluded: string[];
}

/** One weight entry read from fixtures/core-weights.json. */
export interface CoreWeight {
  /** Relative events per session. */
  weight: number;
  /** Events per sample. */
  k: number;
  /** Stated reason for the weight. */
  basis: string;
  /** Reason the row is excluded from every exchange. */
  excluded?: string;
}

/** Weight table keyed by core case identifier. */
export type CoreWeights = Record<string, CoreWeight>;

/** Portable summary shared by terminal, artifact and workflow output. */
export interface CoreSummary {
  /** Whether a prepared baseline participated. */
  mode: 'measure' | 'compare';
  /** Measured fresh pages per case and variant. */
  runs: number;
  /** Discarded fresh pages per case and variant. */
  warmup: number;
  /** Candidate commit, written by the runner. */
  revision?: string;
  /** Baseline commit, written by the runner; null in measure mode. */
  baselineRevision?: string | null;
  /** Results in requested fixture order. */
  cases: CoreCaseResult[];
  /** Weighted exchanges, present in compare mode. */
  weighted?: {
    blocking: CoreWeightedExchange;
    feedback: CoreWeightedExchange;
  };
}
