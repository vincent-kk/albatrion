import type { SummaryRow } from '../types';
import type { summarizePage } from './summarizePage';

/** One retained page summary, independently reproducible from the raw page. */
export interface SampleResult {
  id: string;
  lane: string;
  index: number;
  file: string;
  summary: ReturnType<typeof summarizePage>;
}

/**
 * Aggregate fresh-page sample summaries with the protocol's two-level quantiles.
 * @param samples - Ten retained samples per fixture and lane; no warm-ups
 * @returns Rows with sample-median median and nearest-rank p95 of sample p95 values
 */
export function summarizeResults(samples: SampleResult[]) {
  const rows: SummaryRow[] = [];
  for (const sample of samples) {
    if (rows.some((row) => row.id === sample.id && row.lane === sample.lane))
      continue;
    const group = samples.filter(
      (entry) => entry.id === sample.id && entry.lane === sample.lane,
    );
    const quantiles = (values: (number | null)[]) => {
      const sorted = values
        .filter((value): value is number => value !== null)
        .sort((a, b) => a - b);
      const middle = Math.floor(sorted.length / 2);
      return {
        median: sorted.length
          ? sorted.length % 2
            ? sorted[middle]
            : (sorted[middle - 1] + sorted[middle]) / 2
          : null,
        p95: sorted.length ? sorted[Math.ceil(sorted.length * 0.95) - 1] : null,
      };
    };
    const metric = (
      name: 'processing' | 'total' | 'handler' | 'validation',
    ) => ({
      median: quantiles(group.map((entry) => entry.summary[name].median))
        .median,
      p95: quantiles(group.map((entry) => entry.summary[name].p95)).p95,
      observations: group.reduce(
        (sum, entry) => sum + entry.summary[name].count,
        0,
      ),
      observedSamples: group.filter((entry) => entry.summary[name].count > 0)
        .length,
    });
    rows.push({
      id: sample.id,
      lane: sample.lane,
      count: group.length,
      processing: metric('processing'),
      total: metric('total'),
      handler: metric('handler'),
      validation: metric('validation'),
      undelivered: group.reduce(
        (sum, entry) => sum + entry.summary.undelivered,
        0,
      ),
      longestFrame: Math.max(
        ...group.map((entry) => entry.summary.longestFrame),
      ),
      longFrameCount: group.reduce(
        (sum, entry) => sum + entry.summary.longFrameCount,
        0,
      ),
      eventSupported: group.every((entry) => entry.summary.eventSupported),
      frameSupported: group.every((entry) => entry.summary.frameSupported),
      mount: Object.fromEntries(
        (
          [
            'wallMs',
            'eagerPaintedMs',
            'allRevealedMs',
            'eagerNodes',
            'allNodes',
            'eagerDeferred',
            'allDeferred',
            'inputs',
          ] as const
        ).map((name) => [
          name,
          quantiles(group.map((entry) => entry.summary.mount[name])),
        ]),
      ),
    });
  }
  return rows;
}
