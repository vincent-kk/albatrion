import type { CoreFixture } from '../../../../../fixtures/core/types';
import type {
  CoreMetricStatistics,
  CoreUxGrade,
  CoreUxVerdict,
} from '../../../reportTypes';
import { CORE_UX_THRESHOLDS as T } from './coreUxThresholds';

/** Grade a median against an ok bound and a perceptible bound. */
const grade = (
  median: number | null,
  okMs: number,
  perceptibleMs: number,
): CoreUxGrade =>
  median === null
    ? 'n/a'
    : median <= okMs
      ? 'ok'
      : median <= perceptibleMs
        ? 'perceptible'
        : 'janky';

/** Numeric median of a statistic; null when it has none. */
const medianOf = (stats: CoreMetricStatistics): number | null =>
  stats.kind === 'numeric'
    ? stats.medianMs
    : stats.kind === 'mixed' && typeof stats.median === 'number'
      ? stats.median
      : null;

/**
 * Grade blocking and feedback for one variant.
 * @param operation - Measured operation selecting the blocking source and feedback thresholds.
 * @param blocking - blockingMs statistics (typing, first-key).
 * @param longTask - maxLongTaskMs statistics (mount, rebuild); below-threshold or a "<50" median is ok.
 * @param feedback - feedbackCommittedMs statistics.
 * @returns Grades; n/a where the input is not observable.
 */
export function judgeCoreUx(
  operation: CoreFixture['operation'],
  blocking: CoreMetricStatistics,
  longTask: CoreMetricStatistics,
  feedback: CoreMetricStatistics,
): CoreUxVerdict {
  const typed = operation === 'type' || operation === 'first-key';
  const blockingGrade: CoreUxGrade = typed
    ? grade(medianOf(blocking), T.frameMs, T.railInputMs)
    : longTask.kind === 'not-observable'
      ? 'n/a'
      : longTask.kind === 'below-threshold' || medianOf(longTask) === null
        ? 'ok'
        : grade(medianOf(longTask), 0, T.longTaskPerceptibleMs);
  const feedbackGrade =
    operation === 'mount'
      ? grade(medianOf(feedback), T.loadOkMs, T.loadPerceptibleMs)
      : grade(medianOf(feedback), T.railResponseMs, T.responsePerceptibleMs);
  return { blocking: blockingGrade, feedback: feedbackGrade };
}
