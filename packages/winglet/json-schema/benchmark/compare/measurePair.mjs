import { measureBatch } from './measureBatch.mjs';

/**
 * Warm and alternate independent builds with identical batch sizes; never retry based on measured ratios.
 * @param {object[]} workloads Baseline then current workload.
 * @param {boolean} isAsync Whether traversal must be awaited.
 * @param {object} settings Clock, warmup duration, batch duration and odd sample count.
 * @returns {Promise<object>} Per-build median milliseconds per operation and sampling metadata.
 */
export async function measurePair(
  workloads,
  isAsync,
  {
    now = () => performance.now(),
    warmupMs = 1500,
    batchMs = 30,
    rounds = 31,
  } = {},
) {
  let count = 1;
  const warmStart = now();
  do {
    const elapsed = [];
    for (const workload of workloads)
      elapsed.push(await measureBatch(workload, count, isAsync, now));
    if (Math.min(...elapsed) < batchMs && count < 4096) count *= 2;
  } while (now() - warmStart < warmupMs);
  const samples = [[], []];
  for (let round = 0; round < rounds; round++) {
    for (const side of round % 2 ? [1, 0] : [0, 1])
      samples[side].push(
        (await measureBatch(workloads[side], count, isAsync, now)) / count,
      );
  }
  const medians = samples.map(
    (values) => values.sort((a, b) => a - b)[Math.floor(values.length / 2)],
  );
  return {
    baselineMs: medians[0],
    currentMs: medians[1],
    iterations: count,
    rounds,
    warmupMs,
    batchMs,
  };
}
