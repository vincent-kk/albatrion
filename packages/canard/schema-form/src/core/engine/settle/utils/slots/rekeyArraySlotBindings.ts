import { getItemEntries } from '../../../blueprint';
import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { markSlotChange } from './markSlotChange';
import { rekeySlotWriteAddresses } from './rekeySlotWriteAddresses';

/**
 * Move retained item bindings, including foreign declarations, in two phases without path collisions.
 * @param host - Array whose live items have not yet published their new structure
 * @param moves - Source-position destinations, absent for destroyed items
 * @param context - Publication and rollback work for the structural operation
 * @returns Nothing; frozen source instances keep their original paths
 */
export const rekeyArraySlotBindings = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  moves: readonly { previous: string; current?: string }[],
  context: SettlementContext<Self>,
): void => {
  const entries = new Set<BlueprintChildEntry>(host.inactiveSlots?.keys());
  for (const entry of host.inactiveSlotOverlays?.keys() ?? [])
    entries.add(entry);
  if (!entries.size) return;
  const destinations = new Map(
    moves.map((move) => [move.previous, move.current]),
  );
  const pending: {
    entry: BlueprintChildEntry;
    source?: Self;
    overlay?: InactiveSlotOverlay;
  }[] = [];
  for (const entry of entries) {
    const previous = host.path + '/' + entry.name;
    if (!destinations.has(previous)) continue;
    const current = destinations.get(previous);
    if (current === previous) continue;
    const name = current?.slice(current.lastIndexOf('/') + 1);
    const target =
      name === undefined
        ? undefined
        : (getItemEntries(host.blueprintNode, Number(name)).find(
            (candidate) => candidate.node === entry.node,
          ) ?? { ...entry, name });
    const source = host.inactiveSlots?.get(entry);
    const overlay = host.inactiveSlotOverlays?.get(entry);
    markSlotChange(host, entry, undefined, context);
    host.inactiveSlots?.delete(entry);
    host.inactiveSlotOverlays?.delete(entry);
    if (target) pending.push({ entry: target, source, overlay });
  }
  for (const { entry, source, overlay } of pending) {
    markSlotChange(host, entry, undefined, context);
    if (source) (host.inactiveSlots ??= new Map()).set(entry, source);
    if (overlay) (host.inactiveSlotOverlays ??= new Map()).set(entry, overlay);
  }
  rekeySlotWriteAddresses(host);
};
