import type { CoreSummary } from '../reportTypes';

/**
 * Render the same portable result shown locally and in the workflow summary.
 * @param summary - Completed cases; units are milliseconds per write for typing.
 * @returns A short Markdown table retaining void results and retry attempts.
 */
export function renderCoreSummary(summary: CoreSummary): string {
  const rows = summary.cases.map(
    (row) =>
      `| ${row.id} | ${row.candidate.medianMs.toFixed(3)} | ${row.candidate.p95Ms.toFixed(3)} | ${row.baseline?.medianMs.toFixed(3) ?? '—'} | ${row.deltaMs?.toFixed(3) ?? '—'} | ${row.verdict} | ${row.attempt ?? '—'} |`,
  );
  return [
    '# Core form browser benchmark',
    '',
    `${summary.mode}; ${summary.runs} runs and ${summary.warmup} warmup pages per variant. Typing values are ms per write; other values are ms per operation.`,
    '',
    '| Case | Candidate median | Candidate p95 | Baseline median | Delta | Verdict | Attempt |',
    '| --- | ---: | ---: | ---: | ---: | --- | ---: |',
    ...rows,
    '',
    'Speed verdicts are advisory. An invalid baseline/control group is retried once, then marked void.',
    '',
  ].join('\n');
}
