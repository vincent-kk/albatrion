import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { pruneArraySlotTail } from '../../slots/pruneArraySlotTail';
import { supersedeCandidateInput } from '../../source/supersedeCandidateInput';
import { selectRetiredArrayBaseline } from './selectRetiredArrayBaseline';

/**
 * End the working generation of removed array positions.
 * @param host - Array after its working length was written
 * @param previousCount - Length just before this write
 * @param context - Settlement owning previous bindings and Source B
 * @returns Nothing; rollback can still read the first boundary
 */
export const retireArraySources = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  previousCount: number,
  context: SettlementContext<Self>,
): void => {
  const source = context.retainedSources?.get(host);
  const array = source?.array;
  if (!array) return;
  if (host.itemCount >= previousCount) return;
  array.retiredFrom = Math.min(array.retiredFrom, host.itemCount);
  if (source.shouldUseBaseline) selectRetiredArrayBaseline(host, context);
  for (const [entry, slot] of source.slots ?? []) {
    if (Number(entry.name) < host.itemCount) continue;
    if (slot.postPolicyInput)
      supersedeCandidateInput(slot.postPolicyInput, true);
    slot.namedInput = slot.postPolicyInput = slot.writeOrder = undefined;
  }
  if (
    host.inactiveSlots?.size ||
    host.inactiveSlotOverlays?.size ||
    host.inactiveSlotChildren?.size
  )
    pruneArraySlotTail(host, context);
};
