import type { BlueprintChildEntry } from '../../../../../blueprint';

/** Static selection IDs belong to the analyzed child edge. */
const STATIC_IDS = new WeakMap<BlueprintChildEntry, readonly number[]>();

/**
 * Return one stable active-ID list for an ungated child edge.
 * @param entry - Analyzed child edge whose declarations are all active
 * @returns Frozen declaration IDs, identical on every call for the same edge
 */
export const staticIds = (entry: BlueprintChildEntry): readonly number[] => {
  let ids = STATIC_IDS.get(entry);
  if (!ids) {
    const collected: number[] = [];
    for (let index = 0; index < entry.declarations.length; index++)
      collected.push(entry.declarations[index].id);
    ids = Object.freeze(collected);
    STATIC_IDS.set(entry, ids);
  }
  return ids;
};
