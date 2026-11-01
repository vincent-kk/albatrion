import type { ClosingBound } from '../../stageClosingTypes';
import { quantile } from '../validationAfterPaint/quantile';

/** Joint page-index resampling of medians; a missing pair never becomes a numeric pass. */
export function bootstrapStageClosingMetric(
  before: (number | null)[],
  after: (number | null)[],
  seed = 20261031,
  resamples = 10000,
): ClosingBound {
  const invalid = {
    upperBound: null,
    differenceUpperBound: null,
    undefinedRatios: resamples,
  };
  if (
    !before.length ||
    before.length !== after.length ||
    [...before, ...after].some((x) => x === null || !Number.isFinite(x))
  )
    return invalid;
  let state = seed >>> 0;
  const ratios: number[] = [],
    differences: number[] = [];
  let undefinedRatios = 0;
  for (let sample = 0; sample < resamples; sample++) {
    const indices = Array.from({ length: before.length }, () => {
      state += 0x6d2b79f5;
      let value = Math.imul(state ^ (state >>> 15), state | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return Math.floor(
        (((value ^ (value >>> 14)) >>> 0) / 4294967296) * before.length,
      );
    });
    const b = quantile(indices.map((i) => before[i])),
      f = quantile(indices.map((i) => after[i]));
    if (b === null || f === null) {
      undefinedRatios++;
      continue;
    }
    differences.push(f - b);
    if (b < 0) undefinedRatios++;
    else
      ratios.push(b === 0 ? (f === 0 ? 1 : Number.POSITIVE_INFINITY) : f / b);
  }
  ratios.sort((a, b) => a - b);
  const upper = undefinedRatios
    ? null
    : (ratios[Math.max(0, Math.ceil(ratios.length * 0.95) - 1)] ?? null);
  return {
    upperBound: upper === Number.POSITIVE_INFINITY ? '+Infinity' : upper,
    differenceUpperBound: quantile(differences, 0.95),
    undefinedRatios,
  };
}
