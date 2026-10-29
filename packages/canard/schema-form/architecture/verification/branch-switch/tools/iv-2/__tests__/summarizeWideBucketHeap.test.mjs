import assert from 'node:assert/strict';
import { test } from 'node:test';

import { summarizeWideBucketHeap } from '../helpers/summarizeWideBucketHeap.mjs';

const fixture = () =>
  ['node', 'bun'].flatMap((runtime) =>
    [2, 80].flatMap((historyBuckets) =>
      ['A', 'B'].map((lane) => ({
        runtime,
        historyBuckets,
        lane,
        timed: false,
        measurement: 'resident-heap',
        smoke: false,
        staticFields: 1000,
        literalBranches: 80,
        writesPerForm: 80,
        sampleCount: 7,
        formsCreated: 7,
        samples: Array.from({ length: 7 }, (_, index) => ({
          beforeBytes: 100,
          afterBytes: 1000 + index,
          retainedBytes: 900 + index,
        })),
        medianBytes: 903,
      })),
    ),
  );

test('heap-only histories retain all seven samples and report both lane differences', () => {
  const result = summarizeWideBucketHeap(fixture());
  assert.equal(result.passed, true);
  assert.equal(result.rows.length, 4);
  assert.equal(result.exchangeContribution, 0);
  assert.ok(
    result.differences.every(
      (row) => row.A80Minus2Bytes === 0 && row.B80Minus2Bytes === 0,
    ),
  );
});
test('a resident regression fails independently of timing exchange', () => {
  const records = fixture();
  records[1].samples.forEach((sample) => {
    sample.afterBytes += 100;
    sample.retainedBytes += 100;
  });
  records[1].medianBytes += 100;
  assert.equal(summarizeWideBucketHeap(records).passed, false);
});
test('forged counters, reused forms and incomplete histories are rejected', () => {
  const counters = fixture();
  counters[0].samples[0].afterBytes++;
  assert.throws(() => summarizeWideBucketHeap(counters));
  const forms = fixture();
  forms[0].formsCreated = 1;
  assert.throws(() => summarizeWideBucketHeap(forms));
  assert.throws(() => summarizeWideBucketHeap(fixture().slice(1)));
});
