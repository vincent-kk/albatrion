import { quantile } from '../validationAfterPaint/quantile';

/** Resample paired pages with bootstrapProcessingRatio's PRNG and report the pooled handler p95 difference upper bound. */
export function bootstrapPooledHandlerDifference(
  before: { handler: number[] }[],
  after: { handler: number[] }[],
  seed = 20261031,
  resamples = 10000,
): number | null {
  if (
    !before.length ||
    before.length !== after.length ||
    [...before, ...after].some(
      (page) =>
        !page.handler.length ||
        page.handler.some((value) => !Number.isFinite(value)),
    )
  )
    return null;
  let state = seed >>> 0;
  const differences: number[] = [];
  for (let sample = 0; sample < resamples; sample++) {
    const indices = Array.from({ length: before.length }, () => {
      state += 0x6d2b79f5;
      let value = Math.imul(state ^ (state >>> 15), state | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return Math.floor(
        (((value ^ (value >>> 14)) >>> 0) / 4294967296) * before.length,
      );
    });
    const B = quantile(
      indices.flatMap((index) => before[index].handler),
      0.95,
    );
    const F = quantile(
      indices.flatMap((index) => after[index].handler),
      0.95,
    );
    if (B === null || F === null) return null;
    differences.push(F - B);
  }
  return quantile(differences, 0.95);
}
