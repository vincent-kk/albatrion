import type { CoreMetricStatistics } from '../../../reportTypes';
import { formatCoreNumber } from './formatCoreNumber';

/**
 * Format a metric median without converting censored Long Tasks to zero.
 * @param stats - Metric statistics, absent when no baseline was measured.
 * @returns The numeric median, a threshold label, or an em dash for unavailable statistics.
 */
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
