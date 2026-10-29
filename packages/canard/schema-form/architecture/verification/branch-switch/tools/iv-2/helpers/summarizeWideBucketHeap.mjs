import assert from 'node:assert/strict';

import { median } from '../../b9-1/helpers/median.mjs';

/** Validate eight heap-only records and compare resident costs without timing weights. */
export function summarizeWideBucketHeap(records) {
  assert.equal(records.length, 8);
  const rows = [];
  for (const runtime of ['node', 'bun'])
    for (const historyBuckets of [2, 80]) {
      const lanes = {};
      for (const lane of ['A', 'B']) {
        const matching = records.filter(
          (record) =>
            record.runtime === runtime &&
            record.historyBuckets === historyBuckets &&
            record.lane === lane,
        );
        assert.equal(matching.length, 1);
        const record = matching[0];
        assert.equal(record.timed, false);
        assert.equal(record.measurement, 'resident-heap');
        assert.equal(record.smoke, false);
        assert.equal(record.staticFields, 1000);
        assert.equal(record.literalBranches, 80);
        assert.equal(record.writesPerForm, 80);
        assert.equal(record.sampleCount, 7);
        assert.equal(record.formsCreated, 7);
        assert.equal(record.samples.length, 7);
        const bytes = record.samples.map((sample) => {
          assert.equal(
            sample.retainedBytes,
            sample.afterBytes - sample.beforeBytes,
          );
          assert.ok(Number.isFinite(sample.retainedBytes));
          return sample.retainedBytes;
        });
        assert.equal(record.medianBytes, median(bytes));
        lanes[lane] = { ...record, maxBytes: Math.max(...bytes) };
      }
      rows.push({
        runtime,
        historyBuckets,
        lanes,
        passed: lanes.B.medianBytes <= lanes.A.maxBytes,
      });
    }
  const differences = ['node', 'bun'].map((runtime) => {
    const two = rows.find(
      (row) => row.runtime === runtime && row.historyBuckets === 2,
    );
    const eighty = rows.find(
      (row) => row.runtime === runtime && row.historyBuckets === 80,
    );
    return {
      runtime,
      A80Minus2Bytes: eighty.lanes.A.medianBytes - two.lanes.A.medianBytes,
      B80Minus2Bytes: eighty.lanes.B.medianBytes - two.lanes.B.medianBytes,
    };
  });
  return {
    rows,
    differences,
    passed: rows.every((row) => row.passed),
    exchangeContribution: 0,
  };
}
