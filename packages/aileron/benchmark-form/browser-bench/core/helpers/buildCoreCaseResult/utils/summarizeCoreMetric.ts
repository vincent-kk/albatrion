import type { CoreMetricExpectation } from '../../../coreObservability';
import type {
  CoreMetricName,
  CoreMetricStatistics,
} from '../../../reportTypes';
import { summarizeCoreSamples } from '../../summarizeCoreSamples';

/**
 * Summarize one metric over a variant's samples according to its observability expectation.
 * @param name - Metric name; Long Task metrics label an unobserved median "<50".
 * @param values - One value per sample, null where unobserved.
 * @param expectation - Observability of the metric for the operation; "null" yields not-observable.
 * @returns numeric when every sample is a number, below-threshold when none is, mixed otherwise (null ordered below every number).
 */
export function summarizeCoreMetric(
  name: CoreMetricName,
  values: readonly (number | null)[],
  expectation: CoreMetricExpectation,
): CoreMetricStatistics {
  if (expectation === 'null' || !values.length)
    return { kind: 'not-observable' };
  const observed = values.filter((value): value is number => value !== null);
  if (expectation !== 'nullable' && observed.length !== values.length)
    throw new Error(
      `${name}: required measurements must all be finite numbers`,
    );
  if (observed.length === values.length) {
    const stats = summarizeCoreSamples(observed);
    return { kind: 'numeric', ...stats };
  }
  if (!observed.length)
    return { kind: 'below-threshold', samples: values.length };
  const sorted = [...values].sort((a, b) =>
    a === null ? (b === null ? 0 : -1) : b === null ? 1 : a - b,
  );
  const middle = sorted[Math.floor(sorted.length / 2)];
  return {
    kind: 'mixed',
    samples: values.length,
    observed: observed.length,
    median: middle ?? '<50',
    maxMs: Math.max(...observed),
  };
}
