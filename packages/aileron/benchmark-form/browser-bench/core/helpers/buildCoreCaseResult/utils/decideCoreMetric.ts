import type {
  CoreMetricComparison,
  CoreMetricName,
  CoreMetricStatistics,
} from '../../../reportTypes';

/** Delay-class metrics: frame quantization noise widens their thresholds. */
const DELAY_METRICS: readonly CoreMetricName[] = [
  'validatorSettledMs',
  'feedbackCommittedMs',
  'validationReportedMs',
  'longestFrameMs',
  'frameOverflowMs',
];
/** Long Task metrics: an unobserved side means "< 50 ms", not 0. */
const LONG_TASK_METRICS: readonly CoreMetricName[] = ['maxLongTaskMs'];

/** Comparable median of a statistic; null when it has none. */
const medianOf = (stats: CoreMetricStatistics): number | null =>
  stats.kind === 'numeric'
    ? stats.medianMs
    : stats.kind === 'mixed' && typeof stats.median === 'number'
      ? stats.median
      : null;

/**
 * Judge one metric by its class thresholds; durationMs keeps decideCoreComparison and never comes here.
 * @param name - Metric name selecting the delay (2 ms / 5 %) or CPU (0.5 ms / 5 %, band 3 %) class.
 * @param candidate - Workspace statistics.
 * @param baseline - Baseline statistics; absent in measure mode.
 * @param control - Byte-identical control statistics; outside its band the metric alone is void.
 * @returns The comparison with null ratio and percent for a zero or missing baseline median.
 */
export function decideCoreMetric(
  name: CoreMetricName,
  candidate: CoreMetricStatistics,
  baseline?: CoreMetricStatistics,
  control?: CoreMetricStatistics,
): CoreMetricComparison {
  if (!baseline || !control) return { candidate, verdict: 'measured' };
  const comparison: CoreMetricComparison = {
    candidate,
    baseline,
    control,
    verdict: 'measured',
  };
  if (candidate.kind === 'not-observable' || baseline.kind === 'not-observable')
    return { ...comparison, verdict: 'not observable' };
  const candidateMedian = medianOf(candidate);
  const baselineMedian = medianOf(baseline);
  const controlMedian = medianOf(control);
  if (
    candidateMedian === null ||
    baselineMedian === null ||
    controlMedian === null
  )
    return {
      ...comparison,
      deltaMs: null,
      deltaPercent: null,
      ratio: null,
      verdict: LONG_TASK_METRICS.includes(name)
        ? 'below threshold'
        : 'not observable',
    };
  const delay = DELAY_METRICS.includes(name);
  const thresholdMs = Math.max(delay ? 2 : 0.5, baselineMedian * 0.05);
  const controlBandMs = Math.max(
    delay ? 2 : 0.5,
    baselineMedian * (delay ? 0.05 : 0.03),
  );
  const deltaMs = candidateMedian - baselineMedian;
  const epsilon =
    Number.EPSILON *
    Math.max(1, baselineMedian, candidateMedian, controlMedian) *
    4;
  const verdict: CoreMetricComparison['verdict'] =
    Math.abs(controlMedian - baselineMedian) > controlBandMs + epsilon
      ? 'void'
      : Math.abs(deltaMs) <= thresholdMs + epsilon
        ? 'within noise'
        : deltaMs > 0
          ? 'slower'
          : 'faster';
  return {
    ...comparison,
    deltaMs,
    deltaPercent:
      baselineMedian === 0 ? null : (deltaMs / baselineMedian) * 100,
    ratio: baselineMedian === 0 ? null : candidateMedian / baselineMedian,
    thresholdMs,
    controlBandMs,
    verdict,
  };
}
