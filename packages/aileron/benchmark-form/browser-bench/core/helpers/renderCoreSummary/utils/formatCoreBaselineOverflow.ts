import type { CoreFrameBudget } from '../../../reportTypes';

/**
 * Show whether the baseline already exceeded a fixed blocking budget.
 * @param budget - Baseline budget; null for mount/rebuild and absent in measure mode.
 * @returns Yes/no or N/A without interpreting unobservable blocking as zero.
 */
export function formatCoreBaselineOverflow(
  budget: CoreFrameBudget | undefined,
): string {
  return budget === null || budget === undefined
    ? 'N/A'
    : budget.overBudget
      ? '예'
      : '아니요';
}
