import { equals } from '@winglet/common-utils/object';

import type { FieldNodeRecord } from '../../../record';
import type { ValidationIssue } from '../../type';

/**
 * Keep the previous verdict's list when a new verdict deep-equals it, so routing reuses its issue objects.
 * @param node - Validated scope; its root runtime holds the previous verdict, which reset clears.
 * @param issues - Verdict just returned by the validator.
 * @returns The previous list when both have the same length and every item deep-equals in order
 *   (including `details` and `source`); otherwise `issues`.
 */
export const retainEqualValidationIssues = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  issues: readonly ValidationIssue[],
): readonly ValidationIssue[] => {
  const previous = node.rootNode.runtime.validationResult?.issues;
  return isEqualVerdict(previous, issues) ? previous : issues;
};

/**
 * Compare two verdicts item by item and in order.
 * @param previous - Recorded verdict, or undefined when none is recorded.
 * @param next - New verdict.
 * @returns True when the lengths match and every item deep-equals.
 */
const isEqualVerdict = (
  previous: readonly unknown[] | undefined,
  next: readonly ValidationIssue[],
): previous is readonly ValidationIssue[] => {
  if (previous === undefined || previous.length !== next.length) return false;
  for (let index = 0; index < next.length; index++)
    if (!equals(previous[index], next[index])) return false;
  return true;
};
