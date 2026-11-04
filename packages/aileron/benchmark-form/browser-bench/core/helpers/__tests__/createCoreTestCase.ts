import type {
  CoreCaseResult,
  CoreMetricComparison,
  CoreMetricName,
} from '../../reportTypes';

/** Numeric comparison with the given medians. */
const comparison = (
  candidate: number,
  baseline: number,
  verdict: CoreMetricComparison['verdict'],
): CoreMetricComparison => ({
  candidate: { kind: 'numeric', medianMs: candidate, p95Ms: candidate, maxMs: candidate, samples: 3 },
  baseline: { kind: 'numeric', medianMs: baseline, p95Ms: baseline, maxMs: baseline, samples: 3 },
  control: { kind: 'numeric', medianMs: baseline, p95Ms: baseline, maxMs: baseline, samples: 3 },
  deltaMs: candidate - baseline,
  deltaPercent: baseline ? ((candidate - baseline) / baseline) * 100 : null,
  ratio: baseline ? candidate / baseline : null,
  thresholdMs: 2,
  controlBandMs: 2,
  verdict,
});

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
  verdicts: Partial<Record<CoreMetricName, CoreMetricComparison['verdict']>> = {},
): CoreCaseResult {
  const names: CoreMetricName[] = [
    'durationMs',
    'blockingMs',
    'maxLongTaskMs',
    'longTaskOverlapMs',
    'preFrameValidatorMs',
    'postFrameValidatorMs',
    'validatorSettledMs',
    'feedbackCommittedMs',
    'validationReportedMs',
    'longestFrameMs',
    'frameOverflowMs',
  ];
  const metrics = Object.fromEntries(
    names.map((name) => {
      const [candidate, baseline] = medians[name] ?? [10, 10];
      return [name, comparison(candidate, baseline, verdicts[name] ?? 'within noise')];
    }),
  ) as Record<CoreMetricName, CoreMetricComparison>;
  const [candidate, baseline] = medians.durationMs ?? [10, 10];
  return {
    id,
    candidate: { medianMs: candidate, p95Ms: candidate, maxMs: candidate, samples: 3 },
    baseline: { medianMs: baseline, p95Ms: baseline, maxMs: baseline, samples: 3 },
    control: { medianMs: baseline, p95Ms: baseline, maxMs: baseline, samples: 3 },
    deltaMs: candidate - baseline,
    thresholdMs: 0.5,
    controlBandMs: 0.3,
    attempt: 1,
    verdict: verdicts.durationMs === 'slower' || verdicts.durationMs === 'faster' ? verdicts.durationMs : 'within noise',
    metrics,
    budget: { candidate: null, baseline: null },
    ux: {
      candidate: { blocking: 'ok', feedback: 'ok' },
      baseline: { blocking: 'ok', feedback: 'ok' },
    },
  };
}
