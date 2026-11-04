import type { CoreCaseResult, CoreMetricName } from '../../../reportTypes';
import { formatCoreMedian } from './formatCoreMedian';

/** "baseline / candidate" cell of one metric's medians. */
export const formatCoreMetricPair = (
  row: CoreCaseResult,
  name: CoreMetricName,
) =>
  `${formatCoreMedian(row.metrics[name].baseline)} / ${formatCoreMedian(row.metrics[name].candidate)}`;
