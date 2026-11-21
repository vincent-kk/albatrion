import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { markSlotChange } from './markSlotChange';

/** Annotates the lazily created `inactiveSlots`; an argument-less `new Map()` would be `Map<any, any>`. */
type InactiveSlots<Self> = Map<BlueprintChildEntry, Self>;
/** Annotates the lazily created `inactiveSlotOverlays`; an argument-less `new Map()` would be `Map<any, any>`. */
type InactiveSlotOverlays = Map<BlueprintChildEntry, InactiveSlotOverlay>;

/**
 * Restore bindings changed after the caller's Source B boundary.
 * @param context - Transition-local first-change journal
 * @returns Nothing; restored sources publish with the final settlement
 */
export const restoreSlotSources = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  for (const [host, source] of context.retainedSources ?? [])
    for (const [entry, previous] of source.slots ?? []) {
      markSlotChange(host, entry);
      if (previous.instance) {
        const slots: InactiveSlots<Self> = (host.inactiveSlots ??= new Map());
        slots.set(entry, previous.instance);
      } else host.inactiveSlots?.delete(entry);
      if (previous.overlay) {
        const overlays: InactiveSlotOverlays = (host.inactiveSlotOverlays ??=
          new Map());
        overlays.set(entry, previous.overlay);
      } else host.inactiveSlotOverlays?.delete(entry);
    }
};
