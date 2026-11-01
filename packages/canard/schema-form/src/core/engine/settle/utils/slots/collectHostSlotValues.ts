import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { InactiveSlotCandidate } from '../../types/slots';
import { collectSlotSourceValues } from './collectSlotSourceValues';
import { getRetainedChildEntry } from './getRetainedChildEntry';
import { getSlotEntryPosition } from './getSlotEntryPosition';

/**
 * Collect a host's last published inactive view without visiting unrelated live siblings.
 * @param host - Live host or a frozen departed reference
 * @param order - Host's document position in the current reader scope
 * @param values - Reader-local item list filled in place
 * @returns Nothing; pending writes use their preceding binding baselines
 */
export const collectHostSlotValues = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  order: readonly number[],
  values: InactiveSlotCandidate[],
): void => {
  const entries = new Set<BlueprintChildEntry>(host.inactiveSlots?.keys());
  for (const entry of host.inactiveSlotOverlays?.keys() ?? [])
    entries.add(entry);
  for (const entry of host.inactiveSlotBaselines?.keys() ?? [])
    entries.add(entry);
  const active = new Set<Self>();
  for (const entry of entries) {
    const baseline = host.inactiveSlotBaselines?.get(entry);
    const source = baseline ? baseline.source : host.inactiveSlots?.get(entry);
    const overlay = baseline
      ? baseline.overlay
      : host.inactiveSlotOverlays?.get(entry);
    const counterpart = baseline
      ? baseline.active
      : host.structure?.[entry.name];
    const childOrder = [
      ...order,
      getSlotEntryPosition(host.blueprintNode, entry),
    ];
    if (baseline?.active && !active.has(baseline.active)) {
      active.add(baseline.active);
      collectHostSlotValues(baseline.active, childOrder, values);
    }
    collectSlotSourceValues(
      entry.node,
      source,
      overlay,
      appendSegment(host.path, entry.name),
      childOrder,
      counterpart,
      values,
    );
  }
  for (const child of host.inactiveSlotChildren?.values() ?? []) {
    if (
      active.has(child) ||
      host.structure?.[child.name] !== child ||
      !child.deliveryInitialized
    )
      continue;
    const entry = getRetainedChildEntry(host, child.name, child.blueprintNode);
    if (!entry) continue;
    collectHostSlotValues(
      child,
      [...order, getSlotEntryPosition(host.blueprintNode, entry)],
      values,
    );
  }
};
