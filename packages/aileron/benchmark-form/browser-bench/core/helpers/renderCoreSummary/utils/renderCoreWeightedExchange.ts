import type { CoreWeightedExchange } from '../../../reportTypes';
import { formatCoreNumber } from './formatCoreNumber';

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
  '| 사례 | 가중치 | k | 기준 µs | 후보 µs | Δ µs/event | 계산 | 기여 µs | 근거 |',
  '| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | --- |',
  ...value.rows.map(
    (row) =>
      `| ${row.id} | ${row.weight} | ${row.k} | ${formatCoreNumber(row.baselineMicros, 0)} | ${formatCoreNumber(row.candidateMicros, 0)} | ${formatCoreNumber(row.deltaMicros, 0)} | ${row.counted ? 'counted' : (row.reason ?? '—')} | ${row.contributionMicros.toFixed(0)} | ${row.basis} |`,
  ),
  '',
  `가중 교환비 Σ(가중치 × Δ) = ${value.exchangeMicros.toFixed(0)} µs (폭 안 행은 0, 음수가 개선); 가중 기준 합 = ${value.weightedBaselineMicros.toFixed(0)} µs; 가중 후보 합 = ${value.weightedCandidateMicros.toFixed(0)} µs; 가중 비율 = ${formatCoreNumber(value.weightedRatio)}.`,
  `제외 행: ${value.excluded.length ? value.excluded.join('; ') : '없음'}`,
  '',
];
