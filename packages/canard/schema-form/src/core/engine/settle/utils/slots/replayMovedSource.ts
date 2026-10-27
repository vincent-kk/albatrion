import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { markWrite } from '../input/markWrite';
import { readLiteralStarMovedInput } from '../literalStar/readLiteralStarMovedInput';
import { isSlotEligible } from './isSlotEligible';
import { replayTransferredSlotInput } from './replayTransferredSlotInput';

/**
 * Replay a surviving slot through ordinary interpretation at every branch depth.
 * @param node - Newly created root or descendant of a candidate-bearing move
 * @param composed - Input the destination would receive without a retained source
 * @param context - Structural settlement whose child distributions preserve kinds
 * @returns Nothing; the node's own source wins and its children still receive input
 */
export const replayMovedSource = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  composed: unknown,
  context: SettlementContext<Self>,
): void => {
  const slots = isSlotEligible(node.runtime);
  if (slots && replayTransferredSlotInput(node, context)) return;
  markWrite(
    node,
    slots
      ? composed
      : readLiteralStarMovedInput(
          context,
          node.path,
          node.blueprintNode,
          composed,
        ),
    context,
  );
  const distribution = context.distributedInputs.get(node);
  if (distribution)
    context.distributedInputs.set(node, {
      ...distribution,
      preserveLatent: true,
    });
};
