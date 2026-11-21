import type { BlueprintChildEntry } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';

/** Changed slot owners and the bindings that have retained named sources. */
type NamedSlotWrites<Self> = Map<Self, Set<BlueprintChildEntry>>;

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
  if (!selectsNamedSource) {
    context.namedSlotWrites?.get(host)?.delete(entry);
    return;
  }
  const writes: NamedSlotWrites<Self> = (context.namedSlotWrites ??= new Map());
  let bindings = writes.get(host);
  if (!bindings) writes.set(host, (bindings = new Set()));
  bindings.add(entry);
  context.retainedSources?.get(host)?.namedChildren?.delete(entry);
};
