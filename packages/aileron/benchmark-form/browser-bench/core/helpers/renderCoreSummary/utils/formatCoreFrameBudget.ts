import type { CoreFrameBudget } from '../../../reportTypes';
import { formatCoreNumber } from './formatCoreNumber';

/**
 * Format one component of the fixed blocking budget.
 * @param value - Blocking budget; null when sub-50 ms blocking is not observable.
 * @param part - Fraction of frame or overflow duration in milliseconds.
 * @returns A fixed-point value, or N/A for an unavailable budget.
 */
export const formatCoreFrameBudget = (
  value: CoreFrameBudget | undefined,
  part: 'frames' | 'overflowMs',
) =>
  value === null || value === undefined
    ? 'N/A'
    : formatCoreNumber(value[part], part === 'frames' ? 2 : 3);
