import assert from 'node:assert/strict';
import { test } from 'node:test';

import { readAlternatingConfig } from '../../../../design-optimization/tools/helpers/readAlternatingConfig.mjs';
import { summarizeAlternating } from '../../../../design-optimization/tools/helpers/summarizeAlternating.mjs';

const read = (...args) =>
  readAlternatingConfig([
    '--worker=single-flat-1000',
    '--lane=A',
    '--warmups=20',
    '--samples=100',
    '--quality=legacy',
    ...args,
  ]);
test('the default formal path retains ten processes without a short flag', () => {
  const config = read();
  assert.equal(config.runs, 10);
  assert.equal(config.formal, true);
  assert.equal(config.shortWindow, undefined);
});
test('only the explicit short flag admits four formal processes', () => {
  const config = read('--runs=4', '--short-window=true');
  assert.equal(config.runs, 4);
  assert.equal(config.shortWindow, true);
});
test('four formal processes without the flag are rejected', () => {
  assert.throws(() => read('--runs=4'), /Formal alternating/);
});
test('the short flag cannot disguise a ten-process run', () => {
  assert.throws(
    () => read('--runs=10', '--short-window=true'),
    /Formal alternating/,
  );
});
test('odd counts and duplicate short flags are rejected', () => {
  assert.throws(
    () => read('--runs=3', '--short-window=true'),
    /even run count/,
  );
  assert.throws(
    () => read('--runs=4', '--short-window=true', '--short-window=true'),
    /Duplicate/,
  );
});
test('the short flag preserves the formal 20/100 requirement', () => {
  assert.throws(
    () =>
      readAlternatingConfig([
        '--worker=single-flat-1000',
        '--lane=A',
        '--runs=4',
        '--short-window=true',
        '--warmups=19',
        '--samples=100',
      ]),
    /Formal alternating/,
  );
});
test('the original estimator splits four real A processes into disjoint two/two halves', () => {
  const row = { id: 'single-flat-1000', operation: 'write' };
  const records = [];
  for (const lane of ['A', 'B'])
    for (let repeat = 0; repeat < 4; repeat++)
      records.push({
        row: row.id,
        lane,
        repeat,
        minima: {
          current: (lane === 'A' ? [100, 102, 104, 106] : [101, 102, 103, 104])[
            repeat
          ],
          legacy: 10,
        },
      });
  const { rows, quality } = summarizeAlternating([row], records, 'legacy');
  assert.deepEqual(rows[0].A.minimaMs, [100, 102]);
  assert.deepEqual(rows[0].Aprime.minimaMs, [104, 106]);
  assert.equal(rows[0].widthMs, 4);
  assert.equal(rows[0].decision, 'unproven');
  assert.equal(quality.passed, true);
});
