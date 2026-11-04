import type {
  CoreCaseResult,
  CoreMetricName,
  CoreWeightedExchange,
  CoreWeightedRow,
  CoreWeights,
} from '../reportTypes';

/** Numeric median in microseconds; null when the statistic has none. */
const microsOf = (
  stats: CoreCaseResult['metrics'][CoreMetricName]['candidate'] | undefined,
) =>
  stats && stats.kind === 'numeric'
    ? stats.medianMs * 1000
    : stats && stats.kind === 'mixed' && typeof stats.median === 'number'
      ? stats.median * 1000
      : null;

/**
 * Apply the owner's weighted exchange rule to one metric: Δ = (candidate − baseline) / k µs per event,
 * exchange = Σ weight × Δ with within-noise rows counted as 0, and the raw weighted ratio beside it.
 * @param metric - Metric whose medians are exchanged.
 * @param cases - Case results of the run; cases absent from the run are excluded as "not measured".
 * @param weights - Weight table; entries with `excluded` never count.
 * @returns Rows in weight-table order, the exchange, the weighted sums and the excluded list as "id: reason".
 */
export function computeCoreWeightedExchange(
  metric: CoreMetricName,
  cases: CoreCaseResult[],
  weights: CoreWeights,
): CoreWeightedExchange {
  const rows: CoreWeightedRow[] = [];
  const excluded: string[] = [];
  for (const [id, weight] of Object.entries(weights)) {
    const comparison = cases.find((row) => row.id === id)?.metrics[metric];
    const baselineMicros = microsOf(comparison?.baseline);
    const candidateMicros = microsOf(comparison?.candidate);
    const verdict = comparison?.verdict;
    const unobservableLoad =
      metric === 'blockingMs' &&
      (id.startsWith('mount-') || id.startsWith('rebuild-'));
    const reason = weight.excluded
      ? weight.excluded
      : !comparison
        ? 'not measured'
        : unobservableLoad
          ? '< 50 ms 관측 불가'
          : verdict === 'slower' || verdict === 'faster'
            ? undefined
            : (verdict ?? 'not measured');
    const sums = Boolean(
      !weight.excluded &&
        !unobservableLoad &&
        comparison &&
        baselineMicros !== null &&
        candidateMicros !== null &&
        verdict !== 'void' &&
        verdict !== 'not observable',
    );
    const counted = reason === undefined && sums;
    const deltaMicros =
      sums && candidateMicros !== null && baselineMicros !== null
        ? (candidateMicros - baselineMicros) / weight.k
        : null;
    if (!sums) excluded.push(`${id}: ${reason ?? verdict}`);
    rows.push({
      id,
      weight: weight.weight,
      k: weight.k,
      basis: weight.basis,
      baselineMicros: sums ? baselineMicros : null,
      candidateMicros: sums ? candidateMicros : null,
      deltaMicros,
      counted,
      ...(reason === undefined ? {} : { reason }),
      contributionMicros:
        counted && deltaMicros !== null ? weight.weight * deltaMicros : 0,
    });
  }
  const summed = rows.filter(
    (row) => row.baselineMicros !== null && row.candidateMicros !== null,
  );
  const weightedBaselineMicros = summed.reduce(
    (sum, row) => sum + row.weight * (row.baselineMicros ?? 0),
    0,
  );
  const weightedCandidateMicros = summed.reduce(
    (sum, row) => sum + row.weight * (row.candidateMicros ?? 0),
    0,
  );
  return {
    metric,
    rows,
    exchangeMicros: rows.reduce((sum, row) => sum + row.contributionMicros, 0),
    weightedBaselineMicros,
    weightedCandidateMicros,
    weightedRatio: weightedBaselineMicros
      ? weightedCandidateMicros / weightedBaselineMicros
      : null,
    excluded,
  };
}
