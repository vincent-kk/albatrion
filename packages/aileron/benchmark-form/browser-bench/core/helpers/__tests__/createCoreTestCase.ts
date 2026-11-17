import type {
  CoreCaseResult,
  CoreMetricComparison,
  CoreMetricName,
} from '../../reportTypes';
import { createCoreTestComparison } from './createCoreTestCase/utils/createCoreTestComparison';

/**
 * Build one compare-mode case result with every metric numeric.
 * @param id - Core case identifier.
 * @param medians - Candidate and baseline medians per metric, in that order; others default to 10/10 within noise.
 * @param verdicts - Verdict per overridden metric; defaults to "measured".
 * @returns A full case result for renderer and exchange tests.
 */
export function createCoreTestCase(
  id: string,
  medians: Partial<Record<CoreMetricName, [number, number]>> = {},
  verdicts: Partial<
    Record<CoreMetricName, CoreMetricComparison['verdict']>
  > = {},
): CoreCaseResult {
  const of = (name: CoreMetricName) => {
    const [candidate, baseline] = medians[name] ?? [10, 10];
    return createCoreTestComparison(
      candidate,
      baseline,
      verdicts[name] ?? 'within noise',
    );
  };
  const metrics: Record<CoreMetricName, CoreMetricComparison> = {
    durationMs: of('durationMs'),
    blockingMs: of('blockingMs'),
    maxLongTaskMs: of('maxLongTaskMs'),
    longTaskOverlapMs: of('longTaskOverlapMs'),
    preFrameValidatorMs: of('preFrameValidatorMs'),
    postFrameValidatorMs: of('postFrameValidatorMs'),
    validatorSettledMs: of('validatorSettledMs'),
    feedbackCommittedMs: of('feedbackCommittedMs'),
    validationReportedMs: of('validationReportedMs'),
    longestFrameMs: of('longestFrameMs'),
    frameOverflowMs: of('frameOverflowMs'),
  };
  const [candidate, baseline] = medians.durationMs ?? [10, 10];
  return {
    id,
    frames: {
      candidate: {
        frameBudget60: {
          frameOverflowMs: { medianMs: 5, p95Ms: 5, maxMs: 5, samples: 3 },
          overBudgetFrames: { medianMs: 2, p95Ms: 3, maxMs: 3, samples: 3 },
        },
        frameBudget120: {
          frameOverflowMs: { medianMs: 25, p95Ms: 25, maxMs: 25, samples: 3 },
          overBudgetFrames: { medianMs: 12, p95Ms: 13, maxMs: 13, samples: 3 },
        },
        frameIntervalNominalMs: [1000 / 120],
        overBudgetFrames: { medianMs: 2, p95Ms: 3, maxMs: 3, samples: 3 },
        longTaskObservedSamples: 0,
      },
      baseline: {
        frameBudget60: {
          frameOverflowMs: { medianMs: 5, p95Ms: 5, maxMs: 5, samples: 3 },
          overBudgetFrames: { medianMs: 1, p95Ms: 2, maxMs: 2, samples: 3 },
        },
        frameBudget120: {
          frameOverflowMs: { medianMs: 25, p95Ms: 25, maxMs: 25, samples: 3 },
          overBudgetFrames: { medianMs: 12, p95Ms: 13, maxMs: 13, samples: 3 },
        },
        frameIntervalNominalMs: [1000 / 60],
        overBudgetFrames: { medianMs: 1, p95Ms: 2, maxMs: 2, samples: 3 },
        longTaskObservedSamples: 1,
      },
    },
    candidate: {
      medianMs: candidate,
      p95Ms: candidate,
      maxMs: candidate,
      samples: 3,
    },
    baseline: {
      medianMs: baseline,
      p95Ms: baseline,
      maxMs: baseline,
      samples: 3,
    },
    control: {
      medianMs: baseline,
      p95Ms: baseline,
      maxMs: baseline,
      samples: 3,
    },
    deltaMs: candidate - baseline,
    thresholdMs: 0.5,
    controlBandMs: 0.3,
    attempt: 1,
    verdict:
      verdicts.durationMs === 'slower' || verdicts.durationMs === 'faster'
        ? verdicts.durationMs
        : 'within noise',
    metrics,
    budget: { candidate: null, baseline: null },
    budget120: { candidate: null, baseline: null },
    ux: {
      candidate: { blocking: 'ok', feedback: 'ok' },
      baseline: { blocking: 'ok', feedback: 'ok' },
    },
  };
}
