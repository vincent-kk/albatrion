// Mirror of browser-bench/core/coreObservability.ts for dependency-free scripts; that file is canonical and a test keeps them equal.

/** Shared validated-load expectations; operation-specific rows narrow these fields. */
const loadMetrics = {
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

/** Which metrics each operation can observe, keyed by `${operation}-${validate|none}`. */
export const coreObservability = {
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
