import type { FieldNodeRecord } from '../../../../../record';
import type { SettlementContext } from '../../../../types/settlement';
import { hasDistributedChildInput } from '../../../input/hasDistributedChildInput';
import { supersedeRevivedSlotSource } from '../../../transition/utils/supersedeRevivedSlotSource';

/**
 * Apply an accepted write's named input and order to the occurrence's retained channels.
 */
export const selectNamedRetainedSources = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  input: unknown,
  context: SettlementContext<Self>,
  order: number,
): void => {
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
      selectNamedRetainedSources(
        child,
        Reflect.get(input, child.name),
        context,
        order,
      );
};
