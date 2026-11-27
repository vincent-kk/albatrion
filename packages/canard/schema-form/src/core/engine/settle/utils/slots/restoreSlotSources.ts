import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { markSlotChange } from './markSlotChange';

/** Annotates the lazily created `__inactiveSlots__`; an argument-less `new Map()` would be `Map<any, any>`. */
type InactiveSlots<Self> = Map<BlueprintChildEntry, Self>;
/** Annotates the lazily created `__inactiveSlotOverlays__`; an argument-less `new Map()` would be `Map<any, any>`. */
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
    for (const [entry, { baseline: previous }] of source.slots ?? []) {
      if (!previous) continue;
      markSlotChange(host, entry);
      if (previous.instance) {
        const slots: InactiveSlots<Self> = (host.__inactiveSlots__ ??=
          new Map());
        slots.set(entry, previous.instance);
      } else host.__inactiveSlots__?.delete(entry);
      if (previous.overlay) {
        const overlays: InactiveSlotOverlays =
          (host.__inactiveSlotOverlays__ ??= new Map());
        overlays.set(entry, previous.overlay);
      } else host.__inactiveSlotOverlays__?.delete(entry);
    }
};
