import type { Nullable } from '@aileron/declare';

import type { FieldNodeRecord } from '../../../record';
import { expireOccupiedSlotMemos } from './expireOccupiedSlotMemos';
import { preserveSlotValueMemos } from './preserveSlotValueMemos';
import { updateSlotChildIndex } from './updateSlotChildIndex';

/**
 * Publish changed slot owners and invalidate only their ancestor read paths.
 * @param root - Tree whose pending detached writes may predate this settlement
 * @returns Nothing; frozen departing views remain independent of live publication
 */
export const commitSlotChanges = <Self extends FieldNodeRecord<Self>>(
  root: Self,
): void => {
  const hosts = root.runtime.slotDirtyHosts;
  if (!hosts?.size) return;
  const visited = new Set<Self>();
  for (const host of hosts) {
    if (!host.detached) {
      for (const [entry, previous] of host.inactiveSlotBaselines ?? []) {
        preserveSlotValueMemos(
          previous.source,
          previous.overlay,
          host.inactiveSlots?.get(entry),
          host.inactiveSlotOverlays?.get(entry),
        );
        updateSlotChildIndex(host, entry.name);
      }
      host.inactiveSlotBaselines?.clear();
      const bindings = new Set(host.inactiveSlots?.keys());
      for (const entry of host.inactiveSlotOverlays?.keys() ?? [])
        bindings.add(entry);
      for (const entry of bindings) {
        expireOccupiedSlotMemos(
          host.inactiveSlots?.get(entry),
          host.inactiveSlotOverlays?.get(entry),
          host.structure?.[entry.name],
        );
      }
    }
    for (
      let current: Nullable<Self> = host;
      current;
      current = current.parent
    ) {
      const parent = current.parent;
      if (parent && !parent.detached)
        updateSlotChildIndex(parent, current.name);
      if (current.detached || visited.has(current)) continue;
      visited.add(current);
      current.inactiveValuesDirty = true;
    }
  }
  hosts.clear();
};
