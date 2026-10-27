import type { FieldNodeRecord } from '../../../../../record';
import type { GateSelectionRound } from '../../../../types/gateSelectionRound';
import type { ChildSelectionFrame } from '../selectEntryStep';
import { selectLiteralTableChildren } from './selectLiteralTableChildren';
import { selectPredicateTableChildren } from './selectPredicateTableChildren';

/**
 * Dispatch once to the table's static membership or ordered predicate selector.
 * @param frame - Shared selection effects and immediate child computation
 * @param round - Eligible round whose immutable table fixes its selector kind
 * @returns Nothing; both selectors preserve the original authored entry order
 */
export const selectTableChildren = <Self extends FieldNodeRecord<Self>>(
  frame: ChildSelectionFrame<Self>,
  round: GateSelectionRound,
): void => {
  if (round.table.predicateGroups.length)
    selectPredicateTableChildren(frame, round);
  else selectLiteralTableChildren(frame, round);
};
