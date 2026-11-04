import type { CoreMetricStatistics } from '../../../reportTypes';
import { formatCoreNumber } from './formatCoreNumber';

/** Median cell of a statistic; Long Task "<50" and other unobserved medians keep their own labels. */
export const formatCoreMedian = (stats: CoreMetricStatistics | undefined) =>
  !stats || stats.kind === 'not-observable'
    ? '—'
    : stats.kind === 'numeric'
      ? formatCoreNumber(stats.medianMs)
      : stats.kind === 'below-threshold'
        ? '< 50'
        : stats.median === '<50'
          ? '< 50'
          : stats.median === null
            ? 'n/a'
            : formatCoreNumber(stats.median);
