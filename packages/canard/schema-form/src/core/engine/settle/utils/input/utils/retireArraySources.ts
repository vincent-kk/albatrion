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
  if (host.__itemCount__ >= previousCount) return;
  array.retiredFrom = Math.min(array.retiredFrom, host.__itemCount__);
  if (source.shouldUseBaseline) selectRetiredArrayBaseline(host, context);
  for (const [entry, slot] of source.slots ?? []) {
    if (Number(entry.name) < host.__itemCount__) continue;
    if (slot.postPolicyInput)
      supersedeCandidateInput(slot.postPolicyInput, true);
    slot.namedInput = slot.postPolicyInput = slot.writeOrder = undefined;
  }
  if (
    host.__inactiveSlots__?.size ||
    host.__inactiveSlotOverlays__?.size ||
    host.__inactiveSlotChildren__?.size
  )
    pruneArraySlotTail(host, context);
};
