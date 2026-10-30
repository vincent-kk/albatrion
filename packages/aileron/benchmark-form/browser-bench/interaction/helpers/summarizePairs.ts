import type { SampleResult } from './summarizeResults';

/**
 * Pair each retained lane page with L at the same fixture/index before taking medians.
 * @param samples - Complete interleaved retained pages; warm-ups excluded.
 * @returns Differences and ratios with coverage; missing ET and censored frames stay absent.
 */
export function summarizePairs(samples: SampleResult[]) {
  const rows: {
    id: string;
    lane: string;
    metric: string;
    count: number;
    differenceMedian: number | null;
    ratioMedian: number | null;
    pairs: { index: number; difference: number; ratio: number }[];
  }[] = [];
  for (const { id, lane } of samples.filter(
    (sample, index) =>
      samples.findIndex(
        (entry) => entry.id === sample.id && entry.lane === sample.lane,
      ) === index,
  ))
    for (const metric of [
      'wallMs',
      'eagerPaintedMs',
      'allRevealedMs',
      'processingP95',
      'handlerP95',
      'validationP95',
      'longestFrame',
    ] as const) {
      const read = (sample: SampleResult) =>
        metric === 'processingP95'
          ? sample.summary.processing.p95
          : metric === 'handlerP95'
            ? sample.summary.handler.p95
            : metric === 'validationP95'
              ? sample.summary.validation.p95
              : metric === 'longestFrame'
                ? sample.summary.longestFrame || null
                : sample.summary.mount[metric];
      const pairs = samples
        .filter((sample) => sample.id === id && sample.lane === lane)
        .flatMap((sample) => {
          const baseline = samples.find(
            (entry) =>
              entry.id === id &&
              entry.lane === 'L' &&
              entry.index === sample.index,
          );
          const value = read(sample),
            reference = baseline ? read(baseline) : null;
          return value !== null && reference !== null && reference > 0
            ? [
                {
                  index: sample.index,
                  difference: value - reference,
                  ratio: value / reference,
                },
              ]
            : [];
        });
      const median = (values: number[]) => {
        values.sort((a, b) => a - b);
        return values.length
          ? values.length % 2
            ? values[(values.length - 1) / 2]
            : (values[values.length / 2 - 1] + values[values.length / 2]) / 2
          : null;
      };
      rows.push({
        id,
        lane,
        metric,
        count: pairs.length,
        differenceMedian: median(pairs.map((pair) => pair.difference)),
        ratioMedian: median(pairs.map((pair) => pair.ratio)),
        pairs,
      });
    }
  return rows;
}
