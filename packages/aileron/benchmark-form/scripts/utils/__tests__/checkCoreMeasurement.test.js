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
  it('requires both budgets and preserves the meaning of the primary aliases', () => {
    const missing = {
      ...sample,
      metrics: { ...sample.metrics, frameBudget120: undefined },
    };
    expect(
      checkCoreMeasurement('mount-flat-500-none', 'candidate', 0, missing, {
        requireObserved: true,
      }),
    ).toContainEqual(expect.stringContaining('frameBudget120'));
    const wrong = {
      ...sample,
      metrics: {
        ...sample.metrics,
        frameBudget60: { frameOverflowMs: 5, overBudgetFrames: 1 },
      },
    };
    expect(
      checkCoreMeasurement('mount-flat-500-none', 'candidate', 0, wrong, {
        requireObserved: true,
      }),
    ).toContainEqual(expect.stringContaining('primary'));
  });
  it('requires the nominal period in every sample rather than silently accepting 120 Hz', () => {
    const missing = { ...sample, metrics: { ...sample.metrics } };
    delete missing.metrics.frameIntervalNominalMs;
    expect(
      checkCoreMeasurement('mount-flat-500-none', 'candidate', 0, missing, {
        requireObserved: true,
      }),
    ).toContainEqual(expect.stringContaining('frameIntervalNominalMs'));
  });

  it('allows explicit 120 Hz locally but preserves the strict 60 Hz CI gate', () => {
    expect(
      checkCoreMeasurement('mount-flat-500-none', 'candidate', 0, sample, {
        requireObserved: true,
      }),
    ).toEqual([]);
    expect(
      checkCoreMeasurement('mount-flat-500-none', 'candidate', 0, sample, {
        requireObserved: true,
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
      checkCoreMeasurement('mount-flat-500-none', 'candidate', 0, wrong, {
        requireObserved: true,
      }),
    ).toContainEqual(expect.stringContaining('frameIntervalNominalMs'));
  });
});
