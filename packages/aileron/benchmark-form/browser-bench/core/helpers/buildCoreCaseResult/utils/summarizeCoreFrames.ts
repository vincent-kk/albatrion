import type { CoreFrameDistribution } from '../../../reportTypes';
import type { CoreMeasurement } from '../../../types';
import { summarizeCoreSamples } from '../../summarizeCoreSamples';

/**
 * Preserve display cadence, frame-overflow counts and Long Task observation counts.
 * @param measurements - Nonempty fresh-page measurements for one variant.
 * @returns Cadence in ms and frame-count statistics; throws for missing count evidence.
 */
export function summarizeCoreFrames(
  measurements: readonly CoreMeasurement[],
): CoreFrameDistribution {
  const periods = measurements.map(
    ({ metrics }) => metrics.frameIntervalNominalMs,
  );
  return {
    frameBudget60: {
      frameOverflowMs: summarizeCoreSamples(
        measurements.map(
          ({ metrics }) => metrics.frameBudget60.frameOverflowMs,
        ),
      ),
      overBudgetFrames: summarizeCoreSamples(
        measurements.map(
          ({ metrics }) => metrics.frameBudget60.overBudgetFrames,
        ),
      ),
    },
    frameBudget120: {
      frameOverflowMs: summarizeCoreSamples(
        measurements.map(
          ({ metrics }) => metrics.frameBudget120.frameOverflowMs,
        ),
      ),
      overBudgetFrames: summarizeCoreSamples(
        measurements.map(
          ({ metrics }) => metrics.frameBudget120.overBudgetFrames,
        ),
      ),
    },
    frameIntervalNominalMs: periods
      .filter((period, index) => periods.indexOf(period) === index)
      .sort((a, b) => a - b),
    overBudgetFrames: summarizeCoreSamples(
      measurements.map(({ metrics }) => metrics.overBudgetFrames),
    ),
    longTaskObservedSamples: measurements.filter(
      ({ metrics }) => metrics.maxLongTaskMs !== null,
    ).length,
  };
}
