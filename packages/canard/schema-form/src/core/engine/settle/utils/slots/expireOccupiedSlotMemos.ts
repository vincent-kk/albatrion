import type { Optional } from '@aileron/declare';

import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { getSlotEntries } from './getSlotEntries';
import { getSlotSource } from './getSlotSource';

/**
 * End inactive entry lifetimes hidden by the final active shape.
 * @param instance - Retained source whose scalar memo may no longer be observable
 * @param overlay - Owner patch carrying an input-only memo
 * @param live - Current shape at the same public address, regardless of kind
 * @returns Nothing; frozen previously returned arrays retain their own entries
 */
export const expireOccupiedSlotMemos = <Self extends FieldNodeRecord<Self>>(
  instance: Optional<Self>,
  overlay: Optional<InactiveSlotOverlay>,
  live: Optional<Self>,
): void => {
  if (!live) return;
  if (instance) instance.inactiveValueMemo = undefined;
  if (overlay) overlay.valueMemo = undefined;
  for (const entry of getSlotEntries(instance, overlay)) {
    const child = getSlotSource(instance, entry, overlay);
    expireOccupiedSlotMemos(
      child.instance,
      child.overlay,
      live.structure?.[entry.name],
    );
  }
};
