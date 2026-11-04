import type { CoreCaseResult } from '../../../reportTypes';
import { formatCoreNumber } from './formatCoreNumber';

/**
 * Format typing outliers beside the one-off first-write cost.
 * @param typing - Pooled variant distributions; absent when typing does not apply.
 * @param variant - Baseline or candidate distribution to display.
 * @returns First-write ms, maximum handler ms and over-budget count, or an em dash.
 */
export const formatCoreTypingSpread = (
  typing: CoreCaseResult['typing'],
  variant: 'baseline' | 'candidate',
) => {
  const distribution = typing?.[variant];
  return distribution
    ? `${formatCoreNumber(distribution.firstWriteMedianMs)} · ${formatCoreNumber(distribution.handlerMaxMs)} · ${distribution.overBudgetWrites}`
    : '—';
};
