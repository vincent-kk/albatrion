import type { BlueprintChildEntry } from '../../../../blueprint';
import { getHostDerived } from '../../../../utils/cache/derivedRecords';

/** Static selection IDs belong to the analyzed child edge. */

/**
 * Return one stable active-ID list for an ungated child edge.
 * @param entry - Analyzed child edge whose declarations are all active
 * @returns Frozen declaration IDs, identical on every call for the same edge
 */
export const staticIds = (entry: BlueprintChildEntry): readonly number[] => {
  const record = getHostDerived<
    'staticIds',
    Map<BlueprintChildEntry, readonly number[]>
  >(entry.node);
  const entries = (record.staticIds ??= new Map());
  let ids = entries.get(entry);
  if (!ids) {
    const collected: number[] = [];
    for (let index = 0; index < entry.declarations.length; index++)
      collected.push(entry.declarations[index].id);
    ids = Object.freeze(collected);
    entries.set(entry, ids);
  }
  return ids;
};
