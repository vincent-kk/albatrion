/**
 * Describe observed sampling intervals without substituting the requested period.
 * @param {number[]} periods Nonnegative integer-microsecond profile intervals.
 * @returns Observed mean, percentiles and recurring histogram-band spacing; a single band cannot identify a quantum.
 * @throws When no finite, nonnegative sampling intervals are supplied.
 */
export function summarizePeriods(periods) {
  if (
    !periods.length ||
    periods.some((value) => !Number.isFinite(value) || value < 0)
  )
    throw new Error('Invalid sampling intervals');
  const sorted = [...periods].sort((a, b) => a - b);
  const histogram = new Map();
  for (const value of sorted)
    histogram.set(value, (histogram.get(value) ?? 0) + 1);
  const bands = [];
  for (const [value, count] of histogram) {
    let band = bands.at(-1);
    if (!band || value > band.end + 1) {
      band = { start: value, end: value, count: 0, sum: 0 };
      bands.push(band);
    }
    band.end = value;
    band.count += count;
    band.sum += value * count;
  }
  const centers = bands
    .filter(
      (band) =>
        band.count >= Math.max(3, periods.length * 0.001) && band.start > 0,
    )
    .map((band) => band.sum / band.count);
  const spacings = centers
    .slice(1)
    .map((value, index) => value - centers[index])
    .sort((a, b) => a - b);
  return {
    samples: periods.length,
    measuredPeriodUs:
      periods.reduce((sum, value) => sum + value, 0) / periods.length,
    percentilesUs: {
      p10: sorted[Math.floor((sorted.length - 1) * 0.1)],
      p50: sorted[Math.floor((sorted.length - 1) * 0.5)],
      p90: sorted[Math.floor((sorted.length - 1) * 0.9)],
    },
    zeroIntervals: histogram.get(0) ?? 0,
    encodingUnitUs: 1,
    quantizationUnitEstimateUs: spacings.length
      ? spacings[spacings.length >> 1]
      : null,
    recurringBandCentersUs: centers,
    quantizationMethod:
      'Median distance between recurring contiguous integer-us histogram bands (>= max(3 samples, 0.1%)); observed spacing estimate, not a proven clock resolution; null when fewer than two bands recur',
  };
}
