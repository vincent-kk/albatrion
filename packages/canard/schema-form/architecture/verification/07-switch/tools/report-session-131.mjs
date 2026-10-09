import assert from 'node:assert/strict';
import { reportCluster129 } from './report-cluster-129.mjs';
import { medianInterval131 } from './median-interval-131.mjs';
import { mergeRows131 } from './merge-rows-131.mjs';
import { aaCounts131 } from './aa-band-131.mjs';

/** Reuse 129 normalization/judgment with the approved 131 interval, unique histories and actual-block A/A bands. */
export function reportSession131(input) {
  const first = mergeRows131(input.records), confirm = mergeRows131(input.confirmRecords ?? []), fullBlocks = input.fullBlocks ?? 24;
  if (input.aa) assert.equal(input.aa.method?.intervalId, 'order-statistic-median-131', 'Recompute A/A with the 131 interval before using its 105C-01 floor');
  const result = reportCluster129({ ...input, records: first.records, confirmRecords: confirm.records, interval131: medianInterval131 });
  result.method.intervalId = 'order-statistic-median-131';
  result.method.rowDependence = '상관된 비동일 행은 유지하며 이항 범위는 명목 범위입니다.';
  result.mergedRows = first.mergedRows;
  result.rows = result.rows.map(row => {
    const raw = first.records.find(item => item.record.fixture === row.fixture && item.record.validation === row.validation
      && [...item.record.verdictColumns, ...item.record.recordColumns].includes(row.mode));
    const scope = row.blocks >= fullBlocks ? 'full' : 'reduced';
    return { ...row, scope, plannedBlocks: raw?.record.scope131?.blocks ?? row.blocks,
      scopeReason: raw?.record.scope131?.scope === 'reduced' && scope === 'full' ? 'all-measured-blocks' : raw?.record.scope131?.reason ?? null,
      mergedKeys: first.mergedRows.find(item => item.key === row.key)?.mergedKeys ?? [row.key] };
  });
  if (result.stage === 'AA') {
    result.aaSummary.bands = aaCounts131(result.rows, fullBlocks);
    result.aaSummary.passed = result.aaSummary.bands.passed;
    result.decision = result.aaSummary.passed ? 'AA_PASS' : 'AA_FAIL';
  } else assert(result.rows.every(row => !row.statistic.unbounded), 'A verdict needs at least eight blocks for every interval');
  return result;
}
