import type { CoreCaseResult } from '../../../reportTypes';

/**
 * Format observed feedback classes and the repeat exact count.
 * @param typing - Per-variant typing distributions; absent for operations without typing.
 * @param variant - Baseline or candidate distribution to display.
 * @returns The class counts in attribution order, or an em dash without a distribution.
 */
export const formatCoreFeedbackClasses = (
  typing: CoreCaseResult['typing'],
  variant: 'baseline' | 'candidate',
) => {
  const distribution = typing?.[variant];
  if (!distribution) return '—';
  const { exact, censored, noChange, superseded } = distribution.classes;
  return `${exact}/${censored}/${noChange}/${superseded} (2–20 exact ${distribution.repeatExact})`;
};
