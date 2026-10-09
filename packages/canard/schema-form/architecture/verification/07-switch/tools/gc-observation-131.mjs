import { median129 } from './median-129.mjs';

/** Aggregate per-sample perf_hooks overlap masks next to unmodified row statistics; missing/free-empty values stay null. */
export function gcObservation131(record, mode) {
  if (!mode.endsWith('-nogc')) return null;
  return Object.fromEntries(['base', 'candidate'].map(role => {
    const observations = record.blocks.flatMap(block => {
      const side = block[role], masks = side.gc?.[mode];
      return masks ? side.samples[mode].map((value, index) => ({ value, ...masks[index] })) : [];
    });
    const free = observations.filter(sample => sample.windowsWithGc === 0).map(sample => sample.value);
    const windows = observations.reduce((sum, sample) => sum + sample.writeWindows, 0);
    const withGc = observations.reduce((sum, sample) => sum + sample.writeWindowsWithGc, 0);
    return [role, { samples: observations.length, gcFreeSamples: free.length, writeWindows: windows,
      writeWindowsWithGc: withGc, writeWindowGcFraction: windows ? withGc / windows : null,
      gcFreeMedian: free.length ? median129(free) : null, unit: mode.startsWith('commits-') ? 'count' : 'ms',
      medianCorrection: 'none; raw timed window, alongside the existing corrected cluster statistic' }];
  }));
}
