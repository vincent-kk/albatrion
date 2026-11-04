import type { CoreCaseResult } from '../../../reportTypes';

/** Feedback class cell: exact/censored/noChange/superseded plus repeat exact count. */
export const formatCoreFeedbackClasses = (
  typing: CoreCaseResult['typing'],
  variant: 'baseline' | 'candidate',
) => {
  const distribution = typing?.[variant];
  if (!distribution) return '—';
  const { exact, censored, noChange, superseded } = distribution.classes;
  return `${exact}/${censored}/${noChange}/${superseded} (2–20 exact ${distribution.repeatExact})`;
};
