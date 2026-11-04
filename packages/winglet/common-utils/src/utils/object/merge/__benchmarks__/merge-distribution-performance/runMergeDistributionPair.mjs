import { deepStrictEqual } from 'node:assert';
import { Bench } from 'tinybench';

import { serializeMergeMeasurement } from './runMergeDistributionPair/utils/serializeMergeMeasurement.mjs';

/**
 * Measure one native-artifact pair with fresh targets and observable batched results.
 * @param implementations - Actual baseline and candidate public merge functions.
 * @param fixture - Shared source, target factory and result consumer.
 * @param afterFirst - Whether the candidate row leads this ABBA process pair.
 * @param batchSize - Calls per timer sample, identical in both arms.
 * @param sink - Explicit result accumulator checked by the executable harness.
 * @returns Raw tinybench summary rows with sample counts and normalized call rates.
 */
export const runMergeDistributionPair = async (
  implementations,
  fixture,
  afterFirst,
  batchSize,
  sink,
) => {
  const { baseline, candidate } = implementations;
  const { source, createTarget, consume } = fixture;
  const sourceBefore = JSON.stringify(source);
  deepStrictEqual(
    candidate(createTarget(), source),
    baseline(createTarget(), source),
  );
  deepStrictEqual(JSON.stringify(source), sourceBefore);
  const before = () => {
    let total = 0;
    for (let index = 0; index < batchSize; index++)
      total += consume(baseline(createTarget(), source));
    sink.total += total;
  };
  const after = () => {
    let total = 0;
    for (let index = 0; index < batchSize; index++)
      total += consume(candidate(createTarget(), source));
    sink.total += total;
  };
  const bench = new Bench({
    time: 1000,
    iterations: 100,
    warmupTime: 500,
    warmupIterations: 100,
  });
  const arms = afterFirst
    ? [
        ['after', after],
        ['before', before],
      ]
    : [
        ['before', before],
        ['after', after],
      ];
  for (const [name, task] of arms) bench.add(name, task);
  await bench.warmup();
  await bench.run();
  const measurements = [];
  for (const task of bench.tasks)
    measurements.push(serializeMergeMeasurement(task, batchSize));
  return measurements;
};
