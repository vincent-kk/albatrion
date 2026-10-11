import { median129 } from './median-129.mjs';

const ranks = new Map();
/** Invert the two-sided sign test with exact integer tails; null endpoints denote the unbounded small-n interval. */
export function medianInterval131(blockDifferences) {
  if (!Array.isArray(blockDifferences) || !blockDifferences.length || !blockDifferences.every(Number.isFinite))
    throw new Error('Nonempty finite block differences are required');
  const n = blockDifferences.length;
  if (!ranks.has(n)) {
    const denominator = 1n << BigInt(n);
    let term = 1n, cumulative = 0n, tail = 0n, k = 0;
    for (let j = 0; j < n; j++) {
      cumulative += term;
      if (cumulative * 200n > denominator) break;
      k = j + 1; tail = cumulative;
      term = term * BigInt(n - j) / BigInt(j + 1);
    }
    const coverage = 1 - 2 * Number(tail * 10000000000000000n / denominator) / 10000000000000000;
    ranks.set(n, { k, coverage });
  }
  const { k, coverage } = ranks.get(n), sorted = blockDifferences.toSorted((a, b) => a - b);
  const center = median129(sorted), low = k ? sorted[k - 1] : null, high = k ? sorted[n - k] : null;
  return { median: center, low, high, halfWidth: k ? Math.max(center - low, high - center) : null,
    blocks: n, trials: 0, seed: null, k, coverage, unbounded: k === 0 };
}
