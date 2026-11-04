import { getCoreFixture } from '../../../../fixtures/core/getCoreFixture';
import type {
  CoreCaseResult,
  CoreMetricComparison,
  CoreMetricName,
} from '../../reportTypes';
import type { CoreMeasurement } from '../../types';
import { decideCoreComparison } from '../decideCoreComparison';
import { CORE_FRAME_BUDGET_120_MS } from '../observeCoreOperation/utils/coreFrameBudgetMs';
import { selectCoreObservability } from '../selectCoreObservability';
import { summarizeCoreSamples } from '../summarizeCoreSamples';
import { compareCoreDuration } from './utils/compareCoreDuration';
import { computeCoreFrameBudget } from './utils/computeCoreFrameBudget';
import { decideCoreMetric } from './utils/decideCoreMetric';
import { judgeCoreUx } from './utils/judgeCoreUx';
import { summarizeCoreFrames } from './utils/summarizeCoreFrames';
import { summarizeCoreMetric } from './utils/summarizeCoreMetric';
import { summarizeCoreTyping } from './utils/summarizeCoreTyping';

/** Measurements grouped by variant; baseline and control are empty in measure mode. */
export type CoreVariantGroups = Record<
  'candidate' | 'baseline' | 'control',
  CoreMeasurement[]
>;

/**
 * Assemble one case result: the unchanged elapsed verdict plus per-metric comparisons, frame budget, typing distribution and UX grades.
 * @param id - Core case identifier; its fixture selects the observability row.
 * @param attempt - First group or its single retry.
 * @param groups - Measurements per variant.
 * @param compare - Whether baseline and control participate; false yields "measured" everywhere.
 * @returns The case result; a `retry` elapsed verdict is returned as is for the runner to act on.
 */
export function buildCoreCaseResult(
  id: string,
  attempt: 1 | 2,
  groups: CoreVariantGroups,
  compare: boolean,
): CoreCaseResult {
  const fixture = getCoreFixture(id);
  const row = selectCoreObservability(fixture);
  const durations = (variant: keyof CoreVariantGroups) =>
    groups[variant].map((measurement) => measurement.durationMs);
  const duration = compare
    ? decideCoreComparison(
        id,
        durations('baseline'),
        durations('candidate'),
        durations('control'),
        attempt,
      )
    : {
        id,
        candidate: summarizeCoreSamples(durations('candidate')),
        verdict: 'measured' as const,
      };
  const stats = (
    name: Exclude<CoreMetricName, 'durationMs'>,
    variant: keyof CoreVariantGroups,
  ) =>
    summarizeCoreMetric(
      name,
      groups[variant].map((measurement) => measurement.metrics[name]),
      row.metrics[name],
    );
  const compared = (
    name: Exclude<CoreMetricName, 'durationMs'>,
  ): CoreMetricComparison =>
    compare
      ? decideCoreMetric(
          name,
          stats(name, 'candidate'),
          stats(name, 'baseline'),
          stats(name, 'control'),
        )
      : decideCoreMetric(name, stats(name, 'candidate'));
  const metrics: Record<CoreMetricName, CoreMetricComparison> = {
    durationMs: compareCoreDuration(duration),
    blockingMs: compared('blockingMs'),
    maxLongTaskMs: compared('maxLongTaskMs'),
    longTaskOverlapMs: compared('longTaskOverlapMs'),
    preFrameValidatorMs: compared('preFrameValidatorMs'),
    postFrameValidatorMs: compared('postFrameValidatorMs'),
    validatorSettledMs: compared('validatorSettledMs'),
    feedbackCommittedMs: compared('feedbackCommittedMs'),
    validationReportedMs: compared('validationReportedMs'),
    longestFrameMs: compared('longestFrameMs'),
    frameOverflowMs: compared('frameOverflowMs'),
  };
  const ux = (variant: 'candidate' | 'baseline') =>
    judgeCoreUx(
      fixture.operation,
      stats('blockingMs', variant),
      stats('maxLongTaskMs', variant),
      stats('feedbackCommittedMs', variant),
    );
  return {
    ...duration,
    frames: {
      candidate: summarizeCoreFrames(groups.candidate),
      ...(compare
        ? {
            baseline: summarizeCoreFrames(groups.baseline),
            control: summarizeCoreFrames(groups.control),
          }
        : {}),
    },
    metrics,
    budget: {
      candidate: computeCoreFrameBudget(
        fixture.operation,
        stats('blockingMs', 'candidate'),
      ),
      ...(compare
        ? {
            baseline: computeCoreFrameBudget(
              fixture.operation,
              stats('blockingMs', 'baseline'),
            ),
          }
        : {}),
    },
    budget120: {
      candidate: computeCoreFrameBudget(
        fixture.operation,
        stats('blockingMs', 'candidate'),
        CORE_FRAME_BUDGET_120_MS,
      ),
      ...(compare
        ? {
            baseline: computeCoreFrameBudget(
              fixture.operation,
              stats('blockingMs', 'baseline'),
              CORE_FRAME_BUDGET_120_MS,
            ),
          }
        : {}),
    },
    ...(fixture.operation === 'type'
      ? {
          typing: {
            candidate: summarizeCoreTyping(groups.candidate),
            ...(compare
              ? { baseline: summarizeCoreTyping(groups.baseline) }
              : {}),
          },
        }
      : {}),
    ux: {
      candidate: ux('candidate'),
      ...(compare ? { baseline: ux('baseline') } : {}),
    },
  };
}
