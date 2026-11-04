import type { CoreTypingDistribution } from '../../../reportTypes';
import type { CoreMeasurement } from '../../../types';
import { CORE_FRAME_BUDGET_MS } from '../../observeCoreOperation/utils/coreFrameBudgetMs';
import { summarizeCoreSamples } from '../../summarizeCoreSamples';

/**
 * Pool the per-write evidence of a variant's typing samples so long pauses hidden by means stay visible.
 * @param measurements - Typing samples with their `writes`; samples without writes contribute nothing.
 * @returns Pooled handler max/p95, over-budget writes, first-write median, feedback max, class totals, repeat exact count and coalesced count.
 */
export function summarizeCoreTyping(
  measurements: readonly CoreMeasurement[],
): CoreTypingDistribution {
  const writes = measurements.flatMap(
    (measurement) => measurement.writes ?? [],
  );
  const handlers = writes.map((write) => write.handlerMs);
  const feedback = writes
    .map((write) => write.feedbackCommittedMs)
    .filter((value): value is number => value !== null);
  const firstWrites = measurements
    .map((measurement) => measurement.metrics.firstWriteMs)
    .filter((value): value is number => value !== null);
  const classes = { exact: 0, censored: 0, noChange: 0, superseded: 0 };
  for (const { metrics } of measurements) {
    classes.exact += metrics.feedbackClasses.exact;
    classes.censored += metrics.feedbackClasses.censored;
    classes.noChange += metrics.feedbackClasses.noChange;
    classes.superseded += metrics.feedbackClasses.superseded;
  }
  const handlerStats = handlers.length ? summarizeCoreSamples(handlers) : null;
  return {
    samples: measurements.length,
    handlerMaxMs: handlerStats?.maxMs ?? 0,
    handlerP95Ms: handlerStats?.p95Ms ?? 0,
    overBudgetWrites: handlers.filter((ms) => ms > CORE_FRAME_BUDGET_MS).length,
    firstWriteMedianMs: firstWrites.length
      ? summarizeCoreSamples(firstWrites).medianMs
      : 0,
    feedbackMaxMs: feedback.length ? Math.max(...feedback) : null,
    classes,
    repeatExact: writes.filter(
      (write) => write.index > 1 && write.feedbackClass === 'exact',
    ).length,
    coalescedWrites: writes.filter((write) => write.coalesced).length,
  };
}
