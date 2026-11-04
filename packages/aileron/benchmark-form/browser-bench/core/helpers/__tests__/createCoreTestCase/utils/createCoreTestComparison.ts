import type { CoreMetricComparison } from '../../../../reportTypes';

/** Numeric comparison with the given medians. */
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
