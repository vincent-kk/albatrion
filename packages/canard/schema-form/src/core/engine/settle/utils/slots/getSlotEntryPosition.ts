import type { BlueprintChildEntry, BlueprintNode } from '../../../blueprint';
import { getBlueprintChildIndex } from '../latentStore/getBlueprintChildIndex';

/**
 * Read one retained binding's local document position without serializing its path.
 * @param template - Immutable declaring host
 * @param entry - Exact named or concrete array binding
 * @returns Blueprint child index, otherwise the concrete array position
 */
export const getSlotEntryPosition = (
  template: BlueprintNode,
  entry: BlueprintChildEntry,
): number => {
  const index = getBlueprintChildIndex(template, entry.name, entry.node);
  return index >= 0
    ? index
    : template.kind === 'array'
      ? Number(entry.name)
      : 0;
};
