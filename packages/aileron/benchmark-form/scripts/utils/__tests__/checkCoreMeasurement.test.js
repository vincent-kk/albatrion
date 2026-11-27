import { describe, expect, it } from 'vitest';

import { checkCoreMeasurement } from '../checkCoreMeasurement.mjs';

/** None fixture evidence isolates cadence validation from validator observability. */
const sample = {
  durationMs: 10,
  counts: {
    failedCalls: 0,
    markers: 0,
    lifetimeCompiles: 0,
    validations: 0,
    compiles: 0,
  },
  metrics: {
    blockingMs: null,
    maxLongTaskMs: null,
    firstWriteMs: null,
    longTaskOverlapMs: 0,
    preFrameValidatorMs: 0,
    postFrameValidatorMs: 0,
    validatorSettledMs: null,
    feedbackCommittedMs: null,
    validationReportedMs: null,
    longestFrameMs: 20,
    frameOverflowMs: 3.3,
    frames: 3,
    frameIntervalMs: 8.34,
    frameIntervalNominalMs: 1000 / 120,
    overBudgetFrames: 1,
    frameBudget60: { frameOverflowMs: 3.3, overBudgetFrames: 1 },
    frameBudget120: { frameOverflowMs: 11.7, overBudgetFrames: 1 },
  },
};

describe('checkCoreMeasurement cadence', () => {
  it('rejects a validated mount without its single measured-path marker', () => {
    const invalid = {
      ...sample,
      counts: {
        ...sample.counts,
        markers: 0,
        lifetimeCompiles: 1,
        validations: 1,
      },
      metrics: {
        ...sample.metrics,
        validatorSettledMs: 30,
        feedbackCommittedMs: 40,
        validationReportedMs: 40,
      },
    };
    expect(
      checkCoreMeasurement(
        'mount-flat-500-validate',
        'candidate',
        0,
        invalid,
        {},
      ),
    ).toContainEqual(expect.stringContaining('markers'));
  });

  it('rejects a validator failure even when the required load metrics are present', () => {
    const invalid = {
      ...sample,
      counts: {
        ...sample.counts,
        markers: 1,
        failedCalls: 1,
        lifetimeCompiles: 1,
        validations: 1,
      },
      metrics: {
        ...sample.metrics,
        validatorSettledMs: 30,
        feedbackCommittedMs: 40,
        validationReportedMs: 40,
      },
    };
    expect(
      checkCoreMeasurement(
        'mount-flat-500-validate',
        'candidate',
        0,
        invalid,
        {},
      ),
    ).toContainEqual(expect.stringContaining('failedCalls'));
  });

  it('rejects typing with fewer than ten exact writes', () => {
    const invalid = {
      ...sample,
      counts: {
        ...sample.counts,
        markers: 1,
        lifetimeCompiles: 1,
        validations: 20,
      },
      metrics: {
        ...sample.metrics,
        blockingMs: 2,
        firstWriteMs: 4,
        validatorSettledMs: 30,
        feedbackCommittedMs: 40,
        feedbackClasses: { exact: 9, censored: 11, noChange: 0, superseded: 0 },
      },
    };
    expect(
      checkCoreMeasurement(
        'type-flat-500-validate-nonburst',
        'candidate',
        0,
        invalid,
        {},
      ),
    ).toContainEqual(expect.stringContaining('exact writes'));
  });
  it('requires both budgets and preserves the meaning of the primary aliases', () => {
    const missing = {
      ...sample,
      metrics: { ...sample.metrics, frameBudget120: undefined },
    };
    expect(
      checkCoreMeasurement('mount-flat-500-none', 'candidate', 0, missing, {}),
    ).toContainEqual(expect.stringContaining('frameBudget120'));
    const wrong = {
      ...sample,
      metrics: {
        ...sample.metrics,
        frameBudget60: { frameOverflowMs: 5, overBudgetFrames: 1 },
      },
    };
    expect(
      checkCoreMeasurement('mount-flat-500-none', 'candidate', 0, wrong, {}),
    ).toContainEqual(expect.stringContaining('primary'));
  });
  it('requires the nominal period in every sample rather than silently accepting 120 Hz', () => {
    const missing = { ...sample, metrics: { ...sample.metrics } };
    delete missing.metrics.frameIntervalNominalMs;
    expect(
      checkCoreMeasurement('mount-flat-500-none', 'candidate', 0, missing, {}),
    ).toContainEqual(expect.stringContaining('frameIntervalNominalMs'));
  });

  it('allows explicit 120 Hz locally but preserves the strict 60 Hz CI gate', () => {
    expect(
      checkCoreMeasurement('mount-flat-500-none', 'candidate', 0, sample, {}),
    ).toEqual([]);
    expect(
      checkCoreMeasurement('mount-flat-500-none', 'candidate', 0, sample, {
        require60Hz: true,
      }),
    ).toContainEqual(expect.stringContaining('60 Hz'));
  });

  it('rejects cadence evidence whose nominal disagrees with the detected rate', () => {
    const wrong = {
      ...sample,
      metrics: { ...sample.metrics, frameIntervalNominalMs: 1000 / 60 },
    };
    expect(
      checkCoreMeasurement('mount-flat-500-none', 'candidate', 0, wrong, {}),
    ).toContainEqual(expect.stringContaining('frameIntervalNominalMs'));
  });
});
