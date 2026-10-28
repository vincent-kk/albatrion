import { median } from './median.mjs';

/** Preserve all process representatives beside their median and within-window range. */
export function summarizeDistribution(values) {
  return {
    median: median(values),
    min: Math.min(...values),
    max: Math.max(...values),
    processMedians: values,
  };
}
