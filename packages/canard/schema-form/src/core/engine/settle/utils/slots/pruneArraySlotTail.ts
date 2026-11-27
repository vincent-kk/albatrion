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
  for (const [name, child] of host.__inactiveSlotChildren__ ?? []) {
    if (
      Number(name) < host.__itemCount__ &&
      host.__childrenByName__?.[name] === child
    )
      continue;
    const entry = getRetainedChildEntry(host, name, child.blueprintNode);
    if (entry) markSlotChange(host, entry, child, context);
  }
  const entries = new Set<BlueprintChildEntry>(host.__inactiveSlots__?.keys());
  for (const entry of host.__inactiveSlotOverlays__?.keys() ?? [])
    entries.add(entry);
  for (const entry of entries) {
    if (Number(entry.name) < host.__itemCount__) continue;
    markSlotChange(host, entry, undefined, context);
    host.__inactiveSlots__?.delete(entry);
    host.__inactiveSlotOverlays__?.delete(entry);
  }
};
