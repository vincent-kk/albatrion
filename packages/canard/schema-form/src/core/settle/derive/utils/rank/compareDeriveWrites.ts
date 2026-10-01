import type { DeriveWrite } from '../../type';
import { KIND_RANK } from './kindRank';

/**
 * Compare same-target candidates from kind down to return entry order.
 * @param left - New candidate
 * @param right - Current winner
 * @returns Positive when the new candidate has precedence
 */
export const compareDeriveWrites = <Self>(
  left: DeriveWrite<Self>, right: DeriveWrite<Self>,
): number => {
  const kind = KIND_RANK[left.kind] - KIND_RANK[right.kind];
  if (kind) return kind;
  const limit = Math.min(left.sourceOrder.length, right.sourceOrder.length);
  for (let index = 0; index < limit; index++) {
    const difference = left.sourceOrder[index] - right.sourceOrder[index];
    if (difference) return difference;
  }
  const source = left.sourceOrder.length - right.sourceOrder.length;
  if (source) return source;
  return left.layer - right.layer || left.ruleOrder - right.ruleOrder ||
    left.returnOrder - right.returnOrder;
};
