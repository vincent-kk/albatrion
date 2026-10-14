import { median129 } from './median-129.mjs';

/** Nearest-rank quantile, the convention of every earlier interval in this directory. */
const nearestRank = (sorted, proportion) => sorted[Math.ceil(sorted.length * proportion) - 1];

/**
 * 127C-01 cluster bootstrap: one paired difference per ABBA block is the independent unit, so the 99% interval
 * resamples blocks, never the samples inside a process.
 * @param blockDifferences - Per block, median(base samples) − median(candidate samples); at least two finite values
 * @param seed - Nonzero 32-bit xorshift seed, normally `rowSeed129(rowKey)`
 * @param trials - Resampled sets; 1,999 by 127C-01
 * @returns `{ median, low, high, halfWidth, blocks, trials, seed }` where `median` is the row statistic (median129 of
 *   the block differences) and `low`/`high` are the nearest-rank 0.5% and 99.5% points of the resampled medians;
 *   throws on invalid input
 */
export function clusterBootstrap129(blockDifferences, seed, trials = 1999) {
  if (blockDifferences.length < 2 || !blockDifferences.every(Number.isFinite)) throw new Error('Two or more finite block differences are required');
  if (!Number.isInteger(seed) || seed <= 0 || seed > 0xffffffff) throw new Error(`Seed must be a nonzero 32-bit integer: ${seed}`);
  let state = seed >>> 0;
  const medians = [];
  for (let trial = 0; trial < trials; trial++) {
    const resampled = [];
    for (let index = 0; index < blockDifferences.length; index++) {
      state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
      resampled.push(blockDifferences[(state >>> 0) % blockDifferences.length]);
    }
    medians.push(median129(resampled));
  }
  medians.sort((a, b) => a - b);
  const center = median129(blockDifferences), low = nearestRank(medians, .005), high = nearestRank(medians, .995);
  return { median: center, low, high, halfWidth: Math.max(center - low, high - center), blocks: blockDifferences.length, trials, seed };
}
