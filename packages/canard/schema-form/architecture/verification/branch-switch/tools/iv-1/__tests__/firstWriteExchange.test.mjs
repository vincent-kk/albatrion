import assert from 'node:assert/strict';
import test from 'node:test';

import { firstWriteExchange } from '../firstWriteExchange.mjs';

const ids = ['mount-oneOf-80', 'mount-flat-1000', 'mount-nested-d6-f4'];
const fixture = (totalUs, adoptable = true) => [
  {
    adoptable,
    weightedExchange: {
      totalUs,
      weightedAUs: 10000,
      rows: ids.map((row) => ({
        row,
        mount: true,
        weight: 1,
        eventsPerSample: 1,
        BUs: 100,
        decision: 'regressed',
        verdict: 'exchange-allowed',
      })),
    },
  },
  { records: ids.map((row) => ({ row, entries: 10, medianUs: 10 })) },
];

test('charges each deferred scope once to B without changing the original judgment', () => {
  const [judgment, scope] = fixture(-100);
  const before = structuredClone(judgment);
  const result = firstWriteExchange(judgment, scope);
  assert.equal(result.addedTotalUs, 30);
  assert.equal(result.adjustedTotalUs, -70);
  assert.ok(result.additions.every((row) => row.BWithFirstWriteUs === 110));
  assert.equal(result.adjustedAdoptable, true);
  assert.deepEqual(judgment, before);
});

test('revokes mount exchange permission when first-write additions turn the total positive', () => {
  const result = firstWriteExchange(...fixture(-20));
  assert.equal(result.adjustedTotalUs, 10);
  assert.equal(result.adjustedAdoptable, false);
  assert.ok(result.mountRows.every((row) => row.verdict === 'regressed'));
});

test('rejects exact zero and retains failures from the original gates', () => {
  assert.equal(firstWriteExchange(...fixture(-30)).zeroRejected, true);
  assert.equal(firstWriteExchange(...fixture(-30)).adjustedAdoptable, false);
  assert.equal(
    firstWriteExchange(...fixture(-100, false)).adjustedAdoptable,
    false,
  );
});
