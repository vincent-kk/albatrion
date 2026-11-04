import type { CoreMetricName } from './reportTypes';

/** Canonical copy; scripts/coreObservability.mjs mirrors it for dependency-free scripts and a test keeps them equal. */

/** What a metric may hold per operation: required = finite; nullable = null or finite; null = always null; number = always finite. */
export type CoreMetricExpectation = 'required' | 'nullable' | 'null' | 'number';

/** Per-operation expectations shared by page assertions, checkers and the report. */
export interface CoreObservabilityRow {
  /** Expectation per compared metric plus firstWriteMs. */
  metrics: Record<Exclude<CoreMetricName, 'durationMs'> | 'firstWriteMs', CoreMetricExpectation>;
  /** Lifetime compile count expectation. */
  lifetimeCompiles: 'zero' | 'positive';
  /** Operation-window validator run count expectation. */
  validations: 'zero' | 'positive';
  /** Marker elements expected for the measured path. */
  markers: 0 | 1;
  /** Minimum exact writes out of 20; null where no writes occur. */
  minExactWrites: number | null;
}

/** Observability keys are `${operation}-${validate|none}`. */
export type CoreObservabilityKey =
  | 'mount-validate'
  | 'mount-none'
  | 'rebuild-validate'
  | 'type-validate'
  | 'first-key-validate';

const loadMetrics: CoreObservabilityRow['metrics'] = {
  blockingMs: 'null',
  maxLongTaskMs: 'nullable',
  firstWriteMs: 'null',
  longTaskOverlapMs: 'number',
  preFrameValidatorMs: 'number',
  postFrameValidatorMs: 'number',
  validatorSettledMs: 'required',
  feedbackCommittedMs: 'required',
  validationReportedMs: 'required',
  longestFrameMs: 'number',
  frameOverflowMs: 'number',
};

/** Which metrics each operation can observe; a null metric is reported as not observable. */
export const coreObservability: Record<CoreObservabilityKey, CoreObservabilityRow> = {
  'mount-validate': {
    metrics: loadMetrics,
    lifetimeCompiles: 'positive',
    validations: 'positive',
    markers: 1,
    minExactWrites: null,
  },
  'mount-none': {
    metrics: {
      ...loadMetrics,
      validatorSettledMs: 'null',
      feedbackCommittedMs: 'null',
      validationReportedMs: 'null',
    },
    lifetimeCompiles: 'zero',
    validations: 'zero',
    markers: 0,
    minExactWrites: null,
  },
  'rebuild-validate': {
    metrics: loadMetrics,
    lifetimeCompiles: 'positive',
    validations: 'positive',
    markers: 1,
    minExactWrites: null,
  },
  'type-validate': {
    metrics: {
      ...loadMetrics,
      blockingMs: 'required',
      firstWriteMs: 'required',
      validationReportedMs: 'null',
    },
    lifetimeCompiles: 'positive',
    validations: 'positive',
    markers: 1,
    minExactWrites: 10,
  },
  'first-key-validate': {
    metrics: {
      ...loadMetrics,
      blockingMs: 'required',
      validationReportedMs: 'null',
    },
    lifetimeCompiles: 'positive',
    validations: 'positive',
    markers: 1,
    minExactWrites: null,
  },
};
