import type { CoreCaseResult } from '../../../reportTypes';
import { formatCoreNumber } from './formatCoreNumber';

/** Typing distribution cell: first write, max handler, over-budget writes. */
export const formatCoreTypingSpread = (
  typing: CoreCaseResult['typing'],
  variant: 'baseline' | 'candidate',
) => {
  const distribution = typing?.[variant];
  return distribution
    ? `${formatCoreNumber(distribution.firstWriteMedianMs)} · ${formatCoreNumber(distribution.handlerMaxMs)} · ${distribution.overBudgetWrites}`
    : '—';
};
