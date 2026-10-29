import type { Optional } from '@aileron/declare';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getSlotEntries } from './getSlotEntries';
import { getSlotPathNames } from './getSlotPathNames';
import { getSlotSource } from './getSlotSource';
import { markSlotChange } from './markSlotChange';

/**
 * Erase retained sources in a replacement scope without changing frozen instances.
 * @param root - Current tree whose live owners receive clearing patches
 * @param path - Absolute replacement scope
 * @param names - Optional direct child scopes of a batch origin
 * @returns Nothing; publication stays at the next live commit
 */
export const pruneSlotSources = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  path: string,
  names?: readonly string[],
  context?: SettlementContext<Self>,
): void => {
  if (names) {
    for (const name of names)
      pruneSlotSources(root, appendSegment(path, name), undefined, context);
    return;
  }
  const parts = getSlotPathNames(root.runtime, path);
  if (parts === undefined) return;
  const clear = (host: Self): void => {
    const entries = new Set<BlueprintChildEntry>(host.inactiveSlots?.keys());
    for (const entry of host.inactiveSlotOverlays?.keys() ?? [])
      entries.add(entry);
    for (const entry of entries)
      markSlotChange(host, entry, undefined, context);
    host.inactiveSlots?.clear();
    host.inactiveSlotOverlays?.clear();
    for (const child of host.inactiveSlotChildren?.values() ?? [])
      if (host.structure?.[child.name] === child && !child.detached)
        clear(child);
  };
  const patch = (
    source: Optional<Self>,
    overlay: Optional<InactiveSlotOverlay>,
    position: number,
  ): InactiveSlotOverlay => {
    if (position === parts.length) return { replace: true };
    const children = new Map(overlay?.children);
    for (const entry of getSlotEntries(source, overlay)) {
      if (entry.name !== parts[position]) continue;
      const prior = getSlotSource(source, entry, overlay);
      children.set(entry, patch(prior.source, prior.overlay, position + 1));
    }
    return { ...overlay, children };
  };
  const visit = (host: Self, position: number): void => {
    if (position === parts.length) {
      clear(host);
      return;
    }
    const name = parts[position];
    const entries = new Set<BlueprintChildEntry>(host.inactiveSlots?.keys());
    for (const entry of host.inactiveSlotOverlays?.keys() ?? [])
      entries.add(entry);
    for (const entry of entries) {
      if (entry.name !== name) continue;
      markSlotChange(host, entry, undefined, context);
      if (position + 1 === parts.length) {
        host.inactiveSlots?.delete(entry);
        host.inactiveSlotOverlays?.delete(entry);
      } else
        (host.inactiveSlotOverlays ??= new Map()).set(
          entry,
          patch(
            host.inactiveSlots?.get(entry),
            host.inactiveSlotOverlays?.get(entry),
            position + 1,
          ),
        );
    }
    const live = host.structure?.[name];
    if (live && !live.detached) visit(live, position + 1);
  };
  visit(root, 0);
};
