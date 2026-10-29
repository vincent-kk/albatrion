import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Optional } from '@aileron/declare';

import type { BlueprintChildEntry, BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { getSlotEntries } from './getSlotEntries';
import { getSlotSource } from './getSlotSource';

/**
 * Detach a kept candidate's channels from its old array position without reinterpreting them.
 * @param template - Exact candidate whose child bindings must remain distinct
 * @param source - Retained occurrence supplying channels omitted from the patch
 * @param overlay - Exit policy patch, including already materialized nested arrays
 * @returns A source-independent replacement preserving every kept candidate kind
 */
export const materializeKeptSlotOverlay = <Self extends FieldNodeRecord<Self>>(
  template: BlueprintNode,
  source: Optional<Self>,
  overlay: Optional<InactiveSlotOverlay>,
): InactiveSlotOverlay => {
  const inherited = overlay?.replace ? undefined : source;
  const raw =
    overlay && hasOwnProperty(overlay, 'raw') ? overlay.raw : inherited?.raw;
  const undeclaredValues =
    overlay && hasOwnProperty(overlay, 'undeclaredValues')
      ? overlay.undeclaredValues
      : inherited?.undeclaredValues;
  const children = new Map<BlueprintChildEntry, InactiveSlotOverlay>();
  if (template.strategy === 'branch')
    for (const entry of getSlotEntries(source, overlay, template)) {
      const child = getSlotSource(source, entry, overlay);
      children.set(
        entry,
        materializeKeptSlotOverlay(entry.node, child.source, child.overlay),
      );
    }
  return {
    ...overlay,
    replace: true,
    raw,
    undeclaredValues,
    ...(template.kind === 'array'
      ? { itemCount: overlay?.itemCount ?? inherited?.itemCount ?? 0 }
      : undefined),
    ...(children.size ? { children } : undefined),
  };
};
