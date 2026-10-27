import { escapeSegment } from '@winglet/json/pointer';

import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { markSlotChange } from './markSlotChange';

/**
 * Restore bindings changed after the caller's Source B boundary.
 * @param context - Transition-local first-change journal
 * @param scope - Optional finally detached fill subtree being withdrawn
 * @returns Nothing; restored sources publish with the final settlement
 */
export const restoreSlotSources = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  scope?: string,
): void => {
  for (const [host, bindings] of context.slotAutomaticLog ?? [])
    for (const [entry, previous] of bindings) {
      const path = host.path + '/' + escapeSegment(entry.name);
      if (
        scope !== undefined &&
        path !== scope &&
        !path.startsWith(scope + '/')
      )
        continue;
      markSlotChange(host, entry);
      if (previous.source)
        (host.inactiveSlots ??= new Map()).set(entry, previous.source);
      else host.inactiveSlots?.delete(entry);
      if (previous.overlay)
        (host.inactiveSlotOverlays ??= new Map()).set(entry, previous.overlay);
      else host.inactiveSlotOverlays?.delete(entry);
    }
};
