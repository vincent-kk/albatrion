import type { DeriveRoundDecision } from '../../../../derive';
import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { hasDistributedChildInput } from '../../input/hasDistributedChildInput';
import { isLiveOccurrence } from '../../transition/isLiveOccurrence';
import { supersedeRevivedSlotSource } from '../../transition/utils/supersedeRevivedSlotSource';

/**
 * Select named channels of an accepted rule whose working output already matches.
 * @param write - Winner that passed rule resolution and value comparison
 * @param context - Settlement that may still withdraw a fill or replay a revived right
 * @returns Nothing; retention choices change without scheduling a computation
 */
export const retainEqualDeriveWrite = <Self extends FieldNodeRecord<Self>>(
  write: DeriveRoundDecision<Self>['writes'][number],
  context: SettlementContext<Self>,
): void => {
  const target = write.target;
  if (
    !target ||
    (!context.filledNodes.size && !context.hasRevivedSlotSources) ||
    !isLiveOccurrence(target, context)
  )
    return;
  const order = (context.retainedWriteOrder =
    (context.retainedWriteOrder ?? 0) + 1);
  const select = (node: Self, input: unknown): void => {
    const retained = context.retainedSources?.get(node);
    if (retained) {
      if (retained.revivedSlotSource)
        supersedeRevivedSlotSource(retained.revivedSlotSource);
      if (retained.shouldUseBaseline) {
        retained.shouldUseBaseline = false;
        retained.writeOrder = order;
        retained.writeOrigin = 'declarative';
        context.filledNodes.delete(node);
        context.writtenInputs.set(node, input);
      }
    }
    for (const child of node.children ?? [])
      if (
        child.parent === node &&
        child.behavior.type !== 'virtual' &&
        hasDistributedChildInput(
          input,
          child.name,
          node.behavior.type === 'array',
        )
      )
        select(child, Reflect.get(input, child.name));
  };
  select(target, write.value);
};
