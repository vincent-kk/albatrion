import type { CoreCaseResult, CoreMetricName } from '../../../reportTypes';
import { formatCoreMedian } from './formatCoreMedian';

/**
 * Format baseline and candidate medians in that order.
 * @param row - Completed case with per-metric statistics.
 * @param name - Metric whose values share the reported millisecond unit.
 * @returns Two median cells separated by a slash.
 */
export const formatCoreMetricPair = (
  row: CoreCaseResult,
  name: CoreMetricName,
) =>
  `${formatCoreMedian(row.metrics[name].baseline)} / ${formatCoreMedian(row.metrics[name].candidate)}`;
