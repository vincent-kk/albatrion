import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { gateSelectionTable } from './gateSelectionTable';
import { verifyGateSelection } from './verifyGateSelection';

/**
 * Compare real witness inputs and consistency against full positional shadow evaluation.
 * @param node - Host whose schema, children and output have completed this round
 * @param context - Real frame with its independently accumulated table-selection shadow
 * @returns Nothing; retires the round's dirty observer scope after checking S5
 */
export const finishGateTableRound = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): void => {
  const round = context.gateSelectionRounds?.get(node);
  if (!round) return;
  if (gateSelectionTable.mode === 'verify') {
    const frame = context.gateWheelFrame;
    const shadow = frame?.selectionShadow;
    if (frame && shadow) {
      verifyGateSelection(
        frame.consistent === shadow.consistent,
        'S5 consistent differs',
      );
      verifyGateSelection(
        frame.inputs.size === shadow.inputs.size,
        'S5 input key count differs',
      );
      for (const [key, input] of shadow.inputs)
        verifyGateSelection(
          frame.inputs.has(key) &&
            Object.is(frame.inputs.get(key)!.value, input.value),
          'S5 input differs: ' + key,
        );
    }
  }
  round.active = false;
  context.gateSelectionRounds!.delete(node);
};
