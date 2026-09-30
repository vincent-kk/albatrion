import type { DeriveWrite } from '../../type';

/** Kind precedence spans phases and remains stable for the whole settlement. */
export const KIND_RANK = { unsetValue: 4, derived: 3, injectTo: 2, fill: 1 } as const;
/** A more specific authored control wins on the same source node. */
export const LAYER_RANK = { fragment: 1, children: 2, node: 3 } as const;

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
