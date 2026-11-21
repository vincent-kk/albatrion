import type { BlueprintChildEntry } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';

/**
 * Publish the selected source of an inactive binding after its overlay is applied.
 * @param host - Actual owner of the slot, independent of its data path
 * @param entry - Exact declaration receiving the inactive write
 * @param context - Settlement owning the slot mutation
 * @param selectsNamedSource - Whether this write replaces the retained source
 * @returns Nothing; name ownership stays at the candidate changed by the write
 */
export const recordRetainedSlotWrite = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  entry: BlueprintChildEntry,
  context: SettlementContext<Self>,
  selectsNamedSource: boolean,
): void => {
  const source = context.retainedSources?.get(host);
  const slot = source?.slots?.get(entry);
  if (!slot) return;
  slot.selectsNamedSource = selectsNamedSource;
  if (selectsNamedSource) slot.namedInput = undefined;
};
