// Source-CJS diagnostic only; distribution performance uses actual built ESM/CJS artifacts.
// Loaded by vitest.bench.config.ts; MERGE_BENCH_REPETITION fixes paired row order.
import { deepStrictEqual } from 'node:assert';
import { afterAll, bench, describe } from 'vitest';

import { merge } from '../merge';
import { createMergeComparison } from './merge-default-performance/createMergeComparison';
import { createMergePerformanceFixtures } from './merge-default-performance/createMergePerformanceFixtures';
import { orderMergeFixtures } from './merge-default-performance/orderMergeFixtures';

/** origin/1.0.0-beta before options existed; the mutable branch name is not measured. */
const BASELINE_REVISION = '85fa44d49d2f4491b0d4e3f1024c5c80fbb0a558';
/** Earlier proposal has recursive options checks and is diagnostic only. */
const PREVIOUS_REVISION = 'b4083009a207ce028c315c2e77de8353a189663e';
const BATCH_SIZE = 128;
const repetition = Number(process.env.MERGE_BENCH_REPETITION ?? '0');
if (!Number.isInteger(repetition) || repetition < 0 || repetition > 7)
  throw new Error('MERGE_BENCH_REPETITION must be an integer from 0 through 7');
const seed = (0x51a7e002 + repetition) >>> 0;
const fixtures = orderMergeFixtures(createMergePerformanceFixtures(), seed);
const { baseline, candidate, previous, direct, sourceHashes } =
  createMergeComparison(BASELINE_REVISION, PREVIOUS_REVISION, process.cwd());
const sampling = {
  time: 1000,
  iterations: 100,
  warmupTime: 500,
  warmupIterations: 100,
};
/** Result consumption is measured equally for every arm and checked after all rows. */
let sink = 0;

for (const fixture of fixtures) {
  const sourceBefore = JSON.stringify(fixture.source);
  const expected = merge(fixture.createTarget(), fixture.source);
  for (const operation of [baseline, candidate, previous, direct])
    deepStrictEqual(
      operation(fixture.createTarget(), fixture.source),
      expected,
    );
  deepStrictEqual(JSON.stringify(fixture.source), sourceBefore);
}
console.info(
  JSON.stringify({
    baseline: BASELINE_REVISION,
    previous: PREVIOUS_REVISION,
    repetition,
    seed,
    batchSize: BATCH_SIZE,
    fixtures: fixtures.map(({ name }) => name),
    order: repetition % 2 ? 'after-before' : 'before-after',
    sourceHashes: Object.fromEntries(
      Object.entries(sourceHashes).map(([label, hashes]) => [
        label,
        Object.fromEntries(hashes),
      ]),
    ),
  }),
);

for (const fixture of fixtures) {
  const { source, createTarget, consume } = fixture;
  // Distinct lexical callbacks keep public callees monomorphic across fixture rows.
  const before = () => {
    let total = 0;
    for (let index = 0; index < BATCH_SIZE; index++)
      total += consume(baseline(createTarget(), source));
    sink += total;
  };
  const after = () => {
    let total = 0;
    for (let index = 0; index < BATCH_SIZE; index++)
      total += consume(candidate(createTarget(), source));
    sink += total;
  };
  describe(`merge source-CJS diagnostic primary — ${fixture.name}`, () => {
    if (repetition % 2 === 0) {
      bench('before release branch', before, sampling);
      bench('after public wrapper', after, sampling);
    } else {
      bench('after public wrapper', after, sampling);
      bench('before release branch', before, sampling);
    }
  });
}

for (const fixture of fixtures) {
  const { source, createTarget, consume } = fixture;
  describe(`merge source-CJS direct diagnostic — ${fixture.name}`, () => {
    bench(
      'previous recursive options',
      () => {
        let total = 0;
        for (let index = 0; index < BATCH_SIZE; index++)
          total += consume(previous(createTarget(), source));
        sink += total;
      },
      sampling,
    );
    bench(
      'direct candidate recursion',
      () => {
        let total = 0;
        for (let index = 0; index < BATCH_SIZE; index++)
          total += consume(direct(createTarget(), source));
        sink += total;
      },
      sampling,
    );
  });
}

afterAll(() => {
  if (!Number.isFinite(sink) || sink <= 0)
    throw new Error('Merge benchmark results were not consumed');
  console.info(JSON.stringify({ repetition, sink }));
});
