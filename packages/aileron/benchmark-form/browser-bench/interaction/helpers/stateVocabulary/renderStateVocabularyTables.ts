import type { deriveStateVocabularyResults } from './deriveStateVocabularyResults';
import type { StateVocabularyReport } from './reportTypes';

/** Render B/F medians and registered bounds, followed by absolute report-only observations. */
export function renderStateVocabularyTables(
  data: ReturnType<typeof deriveStateVocabularyResults>,
  reports: StateVocabularyReport[],
) {
  const lines = [
    '| Row | Metric | B median (ms) | F median (ms) | F/B upper | F − B upper (ms) |',
    '| --- | --- | ---: | ---: | ---: | ---: |',
  ];
  for (const row of data.rows.filter((r) => r.lane === 'F')) {
    const base = data.rows.find((r) => r.id === row.id && r.lane === 'B');
    for (const [metric, bound] of Object.entries(
      data.comparisons.B[row.id] ?? {},
    ))
      lines.push(
        `| ${row.id} | ${metric} | ${base?.metrics[metric] ?? 'n/a'} | ${row.metrics[metric] ?? 'n/a'} | ${bound.upperBound ?? 'n/a'} | ${bound.differenceUpperBound ?? 'n/a'} |`,
      );
  }
  lines.push(
    '',
    'Report-only raw observations:',
    '',
    '```json',
    JSON.stringify(reports, null, 2),
    '```',
    '',
  );
  return lines.join('\n');
}
