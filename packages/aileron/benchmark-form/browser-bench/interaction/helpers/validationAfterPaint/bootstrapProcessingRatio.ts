import { quantile } from './quantile';

/** Paired pages retain native processing and separately collected fallback values. */
interface PageValues {
  processing: number[];
  handler: number[];
}
/** Joint page-index bootstrap; the same selected index is used for both interleaved lanes. */
export function bootstrapProcessingRatio(
  before: PageValues[],
  after: PageValues[],
  seed = 20261031,
  resamples = 10000,
) {
  let state = seed >>> 0;
  const random = () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const fallbackResamples = { E: 0, F: 0 };
  const ratios: number[] = [];
  let undefinedRatios = 0;
  if (before.length !== after.length || !before.length)
    return { upperBound: null, undefinedRatios: resamples, fallbackResamples };
  for (let iteration = 0; iteration < resamples; iteration++) {
    const indices = Array.from({ length: before.length }, () =>
      Math.floor(random() * before.length),
    );
    const pooled = (pages: PageValues[], lane: 'E' | 'F') => {
      const values = indices.flatMap((index) => pages[index].processing);
      if (values.length) return quantile(values, 0.95);
      fallbackResamples[lane]++;
      return quantile(
        indices.flatMap((index) => pages[index].handler),
        0.95,
      );
    };
    const baseline = pooled(before, 'E'),
      candidate = pooled(after, 'F');
    if (baseline === null || baseline <= 0 || candidate === null)
      undefinedRatios++;
    else ratios.push(candidate / baseline);
  }
  return {
    upperBound: undefinedRatios ? null : quantile(ratios, 0.95),
    undefinedRatios,
    fallbackResamples,
  };
}
