import { describe, expect, it } from 'vitest';

import { buildCoreCaseResult } from '../buildCoreCaseResult';
import { createCoreTestMeasurement } from './createCoreTestMeasurement';

/** Three samples per variant with one overridden candidate metric set. */
const groups = (
  candidate: Parameters<typeof createCoreTestMeasurement>[0],
  baseline: Parameters<typeof createCoreTestMeasurement>[0] = {},
) => ({
  candidate: [1, 2, 3].map(() => createCoreTestMeasurement(candidate, 12)),
  baseline: [1, 2, 3].map(() => createCoreTestMeasurement(baseline, 10)),
  control: [1, 2, 3].map(() => createCoreTestMeasurement(baseline, 10)),
});

describe('buildCoreCaseResult', () => {
  it('preserves observed display cadence and frame counts while keeping the UX budget at 16.7 ms', () => {
    const result = buildCoreCaseResult(
      'type-flat-500-validate-nonburst',
      1,
      groups({
        frameIntervalMs: 8.34,
        frameIntervalNominalMs: 1000 / 120,
        blockingMs: 12,
      }),
      true,
    );
    expect(result.frames.candidate.frameIntervalNominalMs).toEqual([
      1000 / 120,
    ]);
    expect(result.frames.baseline?.frameIntervalNominalMs).toEqual([1000 / 60]);
    expect(result.frames.candidate.overBudgetFrames.medianMs).toBe(2);
    expect(result.frames.candidate.longTaskObservedSamples).toBe(0);
    expect(result.budget.candidate?.overBudget).toBe(false);
    expect(result.budget120.candidate?.overBudget).toBe(true);
    expect(result.budget120.candidate?.frames).toBeCloseTo(12 / 8.3);
    expect(
      result.frames.candidate.frameBudget120.frameOverflowMs.medianMs,
    ).toBe(25);
    expect(result.ux.candidate.blocking).toBe('ok');
  });

  it('keeps the elapsed verdict and judges delay metrics with the 2 ms / 5 % class', () => {
    const result = buildCoreCaseResult(
      'type-flat-500-validate-nonburst',
      1,
      groups({ feedbackCommittedMs: 11.5 }, { feedbackCommittedMs: 10 }),
      true,
    );
    expect(result.verdict).toBe('slower');
    expect(result.deltaMs).toBe(2);
    expect(result.attempt).toBe(1);
    expect(result.metrics.durationMs.verdict).toBe('slower');
    expect(result.metrics.feedbackCommittedMs.verdict).toBe('within noise');
    expect(result.metrics.feedbackCommittedMs.thresholdMs).toBe(2);
    expect(result.metrics.feedbackCommittedMs.deltaMs).toBe(1.5);
    expect(result.metrics.feedbackCommittedMs.ratio).toBeCloseTo(1.15);
    expect(result.metrics.feedbackCommittedMs.deltaPercent).toBeCloseTo(15);
  });

  it('judges CPU metrics with the 0.5 ms / 5 % class and voids a metric whose control leaves its band', () => {
    const result = buildCoreCaseResult(
      'type-flat-500-validate-nonburst',
      1,
      {
        candidate: [createCoreTestMeasurement({ blockingMs: 21 })],
        baseline: [createCoreTestMeasurement({ blockingMs: 20 })],
        control: [createCoreTestMeasurement({ blockingMs: 20.7 })],
      },
      true,
    );
    expect(result.metrics.blockingMs.verdict).toBe('void');
    expect(result.metrics.blockingMs.controlBandMs).toBe(0.6);
    expect(result.metrics.preFrameValidatorMs.verdict).toBe('within noise');
    expect(result.metrics.preFrameValidatorMs.thresholdMs).toBe(0.5);
    expect(result.verdict).not.toBe('void');
  });

  it('reports N/A ratios for a zero baseline and not observable for null-by-design metrics', () => {
    const result = buildCoreCaseResult(
      'mount-flat-500-validate',
      2,
      groups(
        {
          blockingMs: null,
          firstWriteMs: null,
          validationReportedMs: 120,
          longTaskOverlapMs: 3,
        },
        {
          blockingMs: null,
          firstWriteMs: null,
          validationReportedMs: 100,
          longTaskOverlapMs: 0,
        },
      ),
      true,
    );
    expect(result.metrics.blockingMs.verdict).toBe('not observable');
    expect(result.metrics.blockingMs.candidate).toEqual({
      kind: 'not-observable',
    });
    expect(result.metrics.longTaskOverlapMs.ratio).toBeNull();
    expect(result.metrics.longTaskOverlapMs.deltaPercent).toBeNull();
    expect(result.metrics.longTaskOverlapMs.deltaMs).toBe(3);
    expect(result.metrics.longTaskOverlapMs.verdict).toBe('slower');
    expect(result.metrics.validationReportedMs.verdict).toBe('slower');
    expect(result.budget.candidate).toBeNull();
    expect(result.budget.baseline).toBeNull();
    expect(result.typing).toBeUndefined();
  });

  it('reports below threshold when neither side observed a Long Task and mixed medians otherwise', () => {
    const below = buildCoreCaseResult(
      'mount-flat-500-validate',
      1,
      groups(
        { blockingMs: null, firstWriteMs: null, validationReportedMs: 5 },
        { blockingMs: null, firstWriteMs: null, validationReportedMs: 5 },
      ),
      true,
    );
    expect(below.metrics.maxLongTaskMs.verdict).toBe('below threshold');
    expect(below.metrics.maxLongTaskMs.candidate).toEqual({
      kind: 'below-threshold',
      samples: 3,
    });
    expect(below.metrics.maxLongTaskMs.deltaMs).toBeNull();
    expect(below.ux.candidate.blocking).toBe('ok');
    const mixed = buildCoreCaseResult(
      'mount-flat-500-validate',
      1,
      {
        candidate: [
          createCoreTestMeasurement({
            blockingMs: null,
            firstWriteMs: null,
            validationReportedMs: 5,
            maxLongTaskMs: 70,
          }),
          createCoreTestMeasurement({
            blockingMs: null,
            firstWriteMs: null,
            validationReportedMs: 5,
            maxLongTaskMs: 120,
          }),
          createCoreTestMeasurement({
            blockingMs: null,
            firstWriteMs: null,
            validationReportedMs: 5,
          }),
        ],
        baseline: [
          createCoreTestMeasurement({
            blockingMs: null,
            firstWriteMs: null,
            validationReportedMs: 5,
          }),
        ],
        control: [
          createCoreTestMeasurement({
            blockingMs: null,
            firstWriteMs: null,
            validationReportedMs: 5,
          }),
        ],
      },
      true,
    );
    expect(mixed.metrics.maxLongTaskMs.candidate).toEqual({
      kind: 'mixed',
      samples: 3,
      observed: 2,
      median: 70,
      maxMs: 120,
    });
    expect(mixed.metrics.maxLongTaskMs.verdict).toBe('below threshold');
    expect(mixed.ux.candidate.blocking).toBe('perceptible');
  });

  it('derives the frame budget, typing distribution and UX grades for typing', () => {
    const result = buildCoreCaseResult(
      'type-flat-500-validate-nonburst',
      1,
      groups(
        { blockingMs: 20, feedbackCommittedMs: 150 },
        { blockingMs: 8, feedbackCommittedMs: 90 },
      ),
      true,
    );
    expect(result.budget.candidate).toEqual({
      frames: 20 / 16.7,
      overflowMs: 20 - 16.7,
      overBudget: true,
    });
    expect(result.budget.baseline).toEqual({
      frames: 8 / 16.7,
      overflowMs: 0,
      overBudget: false,
    });
    expect(result.ux.candidate).toEqual({
      blocking: 'perceptible',
      feedback: 'perceptible',
    });
    expect(result.ux.baseline).toEqual({ blocking: 'ok', feedback: 'ok' });
    expect(result.typing?.candidate).toEqual({
      samples: 3,
      handlerMaxMs: 18,
      handlerP95Ms: 4,
      overBudgetWrites: 3,
      firstWriteMedianMs: 4,
      feedbackMaxMs: 57,
      classes: { exact: 54, censored: 3, noChange: 3, superseded: 0 },
      repeatExact: 51,
      coalescedWrites: 0,
    });
  });

  it('grades mount feedback by the load thresholds and marks measure mode without comparisons', () => {
    const result = buildCoreCaseResult(
      'mount-flat-500-validate',
      1,
      {
        candidate: [
          createCoreTestMeasurement({
            blockingMs: null,
            firstWriteMs: null,
            feedbackCommittedMs: 1500,
            validationReportedMs: 5,
          }),
        ],
        baseline: [],
        control: [],
      },
      false,
    );
    expect(result.verdict).toBe('measured');
    expect(result.metrics.feedbackCommittedMs.verdict).toBe('measured');
    expect(result.metrics.feedbackCommittedMs.baseline).toBeUndefined();
    expect(result.ux.candidate.feedback).toBe('perceptible');
    expect(result.ux.baseline).toBeUndefined();
  });

  it('grades a mixed Long Task median below 50 ms as ok', () => {
    const measurements = [null, null, 70].map((maxLongTaskMs) =>
      createCoreTestMeasurement({
        blockingMs: null,
        firstWriteMs: null,
        validationReportedMs: 5,
        maxLongTaskMs,
      }),
    );
    const result = buildCoreCaseResult(
      'mount-flat-500-validate',
      1,
      {
        candidate: measurements,
        baseline: measurements,
        control: measurements,
      },
      true,
    );
    expect(result.metrics.maxLongTaskMs.candidate).toMatchObject({
      kind: 'mixed',
      median: '<50',
    });
    expect(result.ux.candidate.blocking).toBe('ok');
  });
});
