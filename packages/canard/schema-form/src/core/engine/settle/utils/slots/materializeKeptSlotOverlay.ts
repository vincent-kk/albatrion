import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Optional } from '@aileron/declare';

import type { BlueprintChildEntry, BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { getSlotEntries } from './getSlotEntries';
import { getSlotSource } from './getSlotSource';

/**
 * Detach a kept candidate's channels from its old array position without reinterpreting them.
 * @param template - Exact candidate whose child bindings must remain distinct
 * @param instance - Retained occurrence supplying channels omitted from the patch
 * @param overlay - Exit policy patch, including already materialized nested arrays
 * @returns A source-independent replacement preserving every kept candidate kind
 */
export const materializeKeptSlotOverlay = <Self extends FieldNodeRecord<Self>>(
  template: BlueprintNode,
  instance: Optional<Self>,
  overlay: Optional<InactiveSlotOverlay>,
): InactiveSlotOverlay => {
  const inherited = overlay?.replace ? undefined : instance;
  const source =
    overlay && hasOwnProperty(overlay, 'source') ? overlay.source : inherited?.source;
  const extras =
    overlay && hasOwnProperty(overlay, 'extras')
      ? overlay.extras
      : inherited?.extras;
  const children = new Map<BlueprintChildEntry, InactiveSlotOverlay>();
  if (template.strategy === 'branch')
    for (const entry of getSlotEntries(instance, overlay, template)) {
      const child = getSlotSource(instance, entry, overlay);
      children.set(
        entry,
        materializeKeptSlotOverlay(entry.node, child.instance, child.overlay),
      );
    }
  return {
    ...overlay,
    replace: true,
    source,
    extras,
    ...(template.kind === 'array'
      ? { itemCount: overlay?.itemCount ?? inherited?.itemCount ?? 0 }
      : undefined),
    ...(children.size ? { children } : undefined),
  };
};
