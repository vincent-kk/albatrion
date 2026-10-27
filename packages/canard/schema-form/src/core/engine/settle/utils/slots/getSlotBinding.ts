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
  host: Self | undefined,
  entry: BlueprintChildEntry,
  overlay?: InactiveSlotOverlay,
): BlueprintChildEntry => {
  if (
    overlay?.children?.has(entry) ||
    (!overlay?.replace &&
      (host?.inactiveSlots?.has(entry) ||
        host?.inactiveSlotOverlays?.has(entry)))
  )
    return entry;
  const token = getBlueprintNodeIdentity(entry.node);
  for (const binding of overlay?.children?.keys() ?? [])
    if (
      binding.name === entry.name &&
      getBlueprintNodeIdentity(binding.node) === token
    )
      return binding;
  if (!overlay?.replace) {
    for (const binding of host?.inactiveSlots?.keys() ?? [])
      if (
        binding.name === entry.name &&
        getBlueprintNodeIdentity(binding.node) === token
      )
        return binding;
    for (const binding of host?.inactiveSlotOverlays?.keys() ?? [])
      if (
        binding.name === entry.name &&
        getBlueprintNodeIdentity(binding.node) === token
      )
        return binding;
  }
  return entry;
};
