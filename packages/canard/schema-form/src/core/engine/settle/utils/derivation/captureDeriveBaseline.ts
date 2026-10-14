import { evaluateDeriveRound } from '../../../derive';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { getDeriveState } from './getDeriveState';

/**
 * Rebase consumed rule values onto restored caller source B after a budget stop.
 * @param context - Restored settlement whose final shape has been recalculated
 * @returns Nothing; subsequent commits use the restored values as their baseline
 */
export const captureDeriveBaseline = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  const state = getDeriveState(context);
  if (!state) return;
  state.consumedRuleValues.clear();
  evaluateDeriveRound(context.root, {
    ...state,
    loadScope: undefined,
    suppressAutomaticWrites: true,
    trace: false,
  });
};
