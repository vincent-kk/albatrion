import type { CoreWeightedExchange } from '../../../reportTypes';
import { formatCoreNumber } from './formatCoreNumber';
import { formatCoreRatio } from './formatCoreRatio';

/**
 * Render the weighted per-event exchange and its raw weighted ratio.
 * @param title - Display title stating the chosen blocking or feedback interpretation.
 * @param value - Weighted row evidence with microsecond contributions and exclusion reasons.
 * @returns Markdown lines for the rows, microsecond sums, ratio and exclusions.
 */
export const renderCoreWeightedExchange = (
  title: string,
  value: CoreWeightedExchange,
) => [
  `### ${title} (${value.metric})`,
  '',
  '| Case | Weight | k | Baseline µs | Candidate µs | Δ µs/event | Counted | Contribution µs | Basis |',
  '| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | --- |',
  ...value.rows.map(
    (row) =>
      `| ${row.id} | ${row.weight} | ${row.k} | ${formatCoreNumber(row.baselineMicros, 0)} | ${formatCoreNumber(row.candidateMicros, 0)} | ${formatCoreNumber(row.deltaMicros, 0)} | ${row.counted ? 'counted' : (row.reason ?? '—')} | ${row.contributionMicros.toFixed(0)} | ${row.basis} |`,
  ),
  '',
  `Weighted exchange Σ(weight × Δ) = ${value.exchangeMicros.toFixed(0)} µs (rows within noise count as 0, negative means improvement); weighted baseline sum = ${value.weightedBaselineMicros.toFixed(0)} µs; weighted candidate sum = ${value.weightedCandidateMicros.toFixed(0)} µs; weighted ratio = ${formatCoreRatio(value.weightedRatio)}.`,
  `Excluded rows: ${value.excluded.length ? value.excluded.join('; ') : 'none'}`,
  '',
];
