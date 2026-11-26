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
    if (!host.isDetached) {
      for (const [entry, previous] of host.__inactiveSlotBaselines__ ?? []) {
        preserveSlotValueMemos(
          previous.instance,
          previous.overlay,
          host.__inactiveSlots__?.get(entry),
          host.__inactiveSlotOverlays__?.get(entry),
        );
        updateSlotChildIndex(host, entry.name);
      }
      host.__inactiveSlotBaselines__?.clear();
      const bindings = new Set(host.__inactiveSlots__?.keys());
      for (const entry of host.__inactiveSlotOverlays__?.keys() ?? [])
        bindings.add(entry);
      for (const entry of bindings) {
        expireOccupiedSlotMemos(
          host.__inactiveSlots__?.get(entry),
          host.__inactiveSlotOverlays__?.get(entry),
          host.__childrenByName__?.[entry.name],
        );
      }
    }
    for (
      let current: Nullable<Self> = host;
      current;
      current = current.__parent__
    ) {
      const parent = current.__parent__;
      if (parent && !parent.isDetached)
        updateSlotChildIndex(parent, current.name);
      if (current.isDetached || visited.has(current)) continue;
      visited.add(current);
      current.__isInactiveValuesDirty__ = true;
    }
  }
  hosts.clear();
};
