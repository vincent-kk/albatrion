import type {
  CoreDurationResult,
  CoreMetricComparison,
} from '../../../reportTypes';

/**
 * Express the elapsed decision in the per-metric comparison shape without re-judging it.
 * @param duration - Result of decideCoreComparison or the measure-mode summary.
 * @returns A comparison whose verdict mirrors the elapsed verdict; `retry` is shown as void.
 */
export function compareCoreDuration(
  duration: CoreDurationResult,
): CoreMetricComparison {
  const numeric = (stats: CoreDurationResult['candidate']) => ({
    kind: 'numeric' as const,
    ...stats,
  });
  const baseline = duration.baseline?.medianMs;
  return {
    candidate: numeric(duration.candidate),
    ...(duration.baseline ? { baseline: numeric(duration.baseline) } : {}),
    ...(duration.control ? { control: numeric(duration.control) } : {}),
    ...(duration.deltaMs !== undefined && baseline !== undefined
      ? {
          deltaMs: duration.deltaMs,
          deltaPercent:
            baseline === 0 ? null : (duration.deltaMs / baseline) * 100,
          ratio: baseline === 0 ? null : duration.candidate.medianMs / baseline,
        }
      : {}),
    ...(duration.thresholdMs !== undefined
      ? { thresholdMs: duration.thresholdMs }
      : {}),
    ...(duration.controlBandMs !== undefined
      ? { controlBandMs: duration.controlBandMs }
      : {}),
    verdict: duration.verdict === 'retry' ? 'void' : duration.verdict,
  };
}
