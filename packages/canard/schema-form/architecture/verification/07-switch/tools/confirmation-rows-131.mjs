import assert from 'node:assert/strict';

/** Return only first-report regression rows in the lane, at the independent full confirmation count. */
export function confirmationRows131(report, lane, blocks) {
  assert(report.format === 'cluster-report-129' && report.stage !== 'AA' && Array.isArray(report.flaggedRegressions), 'Invalid first change report');
  return report.flaggedRegressions.filter(row => row.lane === lane).map(row => ({ ...row, blocks,
    scope: 'full', reason: 'flagged-confirmation' }));
}
