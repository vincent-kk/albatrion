import type { Optional } from '@aileron/declare';

import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';

/**
 * Resolve a moved source by its occurrence name and kind when its declaration changed.
 * @param host - Owner of candidate sources at the current array address
 * @param entry - Destination declaration, or an already retained foreign binding
 * @param overlay - Optional replacement whose child bindings supersede the source
 * @returns The exact stored binding, otherwise the requested declaration
 */
export const getSlotBinding = <Self extends FieldNodeRecord<Self>>(
  host: Optional<Self>,
  entry: BlueprintChildEntry,
  overlay?: InactiveSlotOverlay,
): BlueprintChildEntry => {
  if (
    overlay?.children?.has(entry) ||
    (!overlay?.isWhole &&
      (host?.__inactiveSlots__?.has(entry) ||
        host?.__inactiveSlotOverlays__?.has(entry)))
  )
    return entry;
  const token = getBlueprintNodeIdentity(entry.node);
  for (const binding of overlay?.children?.keys() ?? [])
    if (
      binding.name === entry.name &&
      getBlueprintNodeIdentity(binding.node) === token
    )
      return binding;
  if (!overlay?.isWhole) {
    for (const binding of host?.__inactiveSlots__?.keys() ?? [])
      if (
        binding.name === entry.name &&
        getBlueprintNodeIdentity(binding.node) === token
      )
        return binding;
    for (const binding of host?.__inactiveSlotOverlays__?.keys() ?? [])
      if (
        binding.name === entry.name &&
        getBlueprintNodeIdentity(binding.node) === token
      )
        return binding;
  }
  return entry;
};
