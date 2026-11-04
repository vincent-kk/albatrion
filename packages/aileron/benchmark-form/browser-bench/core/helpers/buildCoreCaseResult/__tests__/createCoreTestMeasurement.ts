import type { CoreMeasurement, CoreMetrics } from '../../../types';

/**
 * Build one complete typing-shaped measurement with overridable metrics.
 * @param metrics - Fields replacing the defaults, null included.
 * @param durationMs - Elapsed metric of the sample.
 * @returns A measurement whose counts satisfy a validated case.
 */
export function createCoreTestMeasurement(
  metrics: Partial<CoreMetrics> = {},
  durationMs = 10,
): CoreMeasurement {
  return {
    durationMs,
    counts: {
      inputs: 501,
      nodes: 600,
      writes: 20,
      validations: 20,
      compiles: 0,
      lifetimeValidations: 21,
      lifetimeCompiles: 1,
      failedCalls: 0,
      markers: 1,
    },
    metrics: {
      durationMs,
      blockingMs: 2,
      maxLongTaskMs: null,
      firstWriteMs: 4,
      longTaskOverlapMs: 0,
      preFrameValidatorMs: 0.5,
      postFrameValidatorMs: 0.2,
      validatorSettledMs: 30,
      feedbackCommittedMs: 40,
      feedbackClasses: { exact: 18, censored: 1, noChange: 1, superseded: 0 },
      validationReportedMs: null,
      frames: 120,
      frameIntervalMs: 16.6,
      longestFrameMs: 20,
      frameOverflowMs: 5,
      overBudgetFrames: 2,
      coalescedWrites: 0,
      ...metrics,
    },
    writes: Array.from({ length: 20 }, (_, index) => ({
      index: index + 1,
      value: 'a'.repeat(index + 1),
      handlerMs: index === 0 ? 4 : index === 5 ? 18 : 2,
      validatorSettledMs: 30,
      feedbackCommittedMs: index < 18 ? 40 + index : null,
      feedbackClass:
        index < 18 ? 'exact' : index === 18 ? 'censored' : 'noChange',
      coalesced: false,
    })),
  };
}
