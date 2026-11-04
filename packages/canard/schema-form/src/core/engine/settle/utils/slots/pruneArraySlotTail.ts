import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getRetainedChildEntry } from './getRetainedChildEntry';
import { markSlotChange } from './markSlotChange';

/**
 * Remove inactive positions destroyed by shortening, keeping old-reference reads.
 * @param host - Live array with its final item count
 * @param context - Final publication and any transition rollback scope
 * @returns Nothing; only existing retained bindings are visited
 */
export const pruneArraySlotTail = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  context: SettlementContext<Self>,
): void => {
  for (const [name, child] of host.inactiveSlotChildren ?? []) {
    if (Number(name) < host.itemCount && host.structure?.[name] === child)
      continue;
    const entry = getRetainedChildEntry(host, name, child.blueprintNode);
    if (entry) markSlotChange(host, entry, child, context);
  }
  const entries = new Set<BlueprintChildEntry>(host.inactiveSlots?.keys());
  for (const entry of host.inactiveSlotOverlays?.keys() ?? [])
    entries.add(entry);
  for (const entry of entries) {
    if (Number(entry.name) < host.itemCount) continue;
    markSlotChange(host, entry, undefined, context);
    host.inactiveSlots?.delete(entry);
    host.inactiveSlotOverlays?.delete(entry);
  }
};
