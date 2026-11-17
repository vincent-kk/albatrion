import type { CoreMetricComparison } from '../../../../reportTypes';

/**
 * Build numeric comparison evidence with explicit medians and verdict.
 * @param candidate - Workspace median in milliseconds.
 * @param baseline - Baseline/control median in milliseconds; zero gives null ratios.
 * @param verdict - Advisory status to exercise report and exchange handling.
 * @returns Complete per-variant statistics and comparison fields for three samples.
 */
export const createCoreTestComparison = (
  candidate: number,
  baseline: number,
  verdict: CoreMetricComparison['verdict'],
): CoreMetricComparison => ({
  candidate: {
    kind: 'numeric',
    medianMs: candidate,
    p95Ms: candidate,
    maxMs: candidate,
    samples: 3,
  },
  baseline: {
    kind: 'numeric',
    medianMs: baseline,
    p95Ms: baseline,
    maxMs: baseline,
    samples: 3,
  },
  control: {
    kind: 'numeric',
    medianMs: baseline,
    p95Ms: baseline,
    maxMs: baseline,
    samples: 3,
  },
  deltaMs: candidate - baseline,
  deltaPercent: baseline ? ((candidate - baseline) / baseline) * 100 : null,
  ratio: baseline ? candidate / baseline : null,
  thresholdMs: 2,
  controlBandMs: 2,
  verdict,
});
