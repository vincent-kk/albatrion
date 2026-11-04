import type {
  CoreCaseResult,
  CoreMetricName,
  CoreWeightedExchange,
  CoreWeights,
} from '../reportTypes';

/**
 * Apply the owner's weighted exchange rule to one metric.
 * @param metric - Metric whose medians are exchanged.
 * @param cases - Case results.
 * @param weights - Weight table.
 * @returns The exchange.
 */
export function computeCoreWeightedExchange(
  metric: CoreMetricName,
  cases: CoreCaseResult[],
  weights: CoreWeights,
): CoreWeightedExchange {
  void cases;
  void weights;
  return {
    metric,
    rows: [],
    exchangeMicros: 0,
    weightedBaselineMicros: 0,
    weightedCandidateMicros: 0,
    weightedRatio: null,
    excluded: [],
  };
}
