import type { CoreSummary } from '../../../../../reportTypes';
import { createCoreTestCase } from '../../../../__tests__/createCoreTestCase';

/**
 * Build stable comparison evidence for renderer table tests.
 * @returns One slower mount, one typing case and both weighted exchange views.
 */
export const createCoreComparedSummary = (): CoreSummary => {
  const mount = createCoreTestCase(
    'mount-flat-500-none',
    { durationMs: [12, 10] },
    {
      durationMs: 'slower',
      blockingMs: 'not observable',
      maxLongTaskMs: 'below threshold',
    },
  );
  mount.candidate = { medianMs: 12, p95Ms: 15, maxMs: 16, samples: 3 };
  mount.metrics.blockingMs = {
    candidate: { kind: 'not-observable' },
    baseline: { kind: 'not-observable' },
    verdict: 'not observable',
  };
  mount.metrics.maxLongTaskMs = {
    candidate: { kind: 'below-threshold', samples: 3 },
    baseline: {
      kind: 'mixed',
      samples: 3,
      observed: 1,
      median: '<50',
      maxMs: 60,
    },
    deltaMs: null,
    verdict: 'below threshold',
  };
  mount.ux = {
    candidate: { blocking: 'ok', feedback: 'n/a' },
    baseline: { blocking: 'ok', feedback: 'n/a' },
  };
  const typing = createCoreTestCase(
    'type-flat-500-validate-nonburst',
    { blockingMs: [1.2, 1], feedbackCommittedMs: [50, 45] },
    { blockingMs: 'slower' },
  );
  typing.budget = {
    candidate: { frames: 1.2 / 16.7, overflowMs: 0, overBudget: false },
    baseline: { frames: 1 / 16.7, overflowMs: 0, overBudget: false },
  };
  typing.typing = {
    candidate: {
      samples: 3,
      handlerMaxMs: 18,
      handlerP95Ms: 4,
      overBudgetWrites: 3,
      firstWriteMedianMs: 4,
      feedbackMaxMs: 57,
      classes: { exact: 54, censored: 3, noChange: 3, superseded: 0 },
      repeatExact: 51,
      coalescedWrites: 0,
    },
    baseline: {
      samples: 3,
      handlerMaxMs: 9,
      handlerP95Ms: 3,
      overBudgetWrites: 0,
      firstWriteMedianMs: 3,
      feedbackMaxMs: 50,
      classes: { exact: 60, censored: 0, noChange: 0, superseded: 0 },
      repeatExact: 57,
      coalescedWrites: 0,
    },
  };
  return {
    mode: 'compare',
    runs: 3,
    warmup: 0,
    cases: [mount, typing],
    weighted: {
      blocking: {
        metric: 'blockingMs',
        rows: [
          {
            id: 'type-flat-500-validate-nonburst',
            weight: 5000,
            k: 1,
            basis: 'typing',
            baselineMicros: 1000,
            candidateMicros: 1200,
            deltaMicros: 200,
            counted: true,
            contributionMicros: 1_000_000,
          },
          {
            id: 'mount-flat-500-none',
            weight: 1,
            k: 1,
            basis: 'mount',
            baselineMicros: null,
            candidateMicros: null,
            deltaMicros: null,
            counted: false,
            reason: '< 50 ms 관측 불가',
            contributionMicros: 0,
          },
        ],
        exchangeMicros: 1_000_000,
        weightedBaselineMicros: 5_000_000,
        weightedCandidateMicros: 6_000_000,
        weightedRatio: 1.2,
        excluded: ['mount-flat-500-none: < 50 ms 관측 불가'],
      },
      feedback: {
        metric: 'feedbackCommittedMs',
        rows: [
          {
            id: 'type-flat-500-validate-nonburst',
            weight: 5000,
            k: 1,
            basis: 'typing',
            baselineMicros: 45000,
            candidateMicros: 50000,
            deltaMicros: 5000,
            counted: false,
            reason: 'within noise',
            contributionMicros: 0,
          },
        ],
        exchangeMicros: 0,
        weightedBaselineMicros: 225_000_000,
        weightedCandidateMicros: 250_000_000,
        weightedRatio: 250 / 225,
        excluded: [],
      },
    },
  };
};
