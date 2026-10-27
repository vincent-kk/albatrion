import type { BlueprintNode } from '../../../blueprint';
import { getHostDerived } from '../../../utils/cache/derivedRecords';

/** Exact child names and reusable template identities retain the first edge. */
type ChildOrderIndex = ReadonlyMap<string, ReadonlyMap<BlueprintNode, number>>;

/**
 * Locate one exact child edge using a lazily prepared immutable-template index.
 * @param host - Declaring template whose child order is fixed
 * @param name - Decoded child name, including concrete array positions
 * @param template - Exact child template identity
 * @returns First matching document position, or -1 for an unlisted edge
 */
export const getBlueprintChildIndex = (
  host: BlueprintNode,
  name: string,
  template: BlueprintNode,
): number => {
  const record = getHostDerived<'childOrderIndex', ChildOrderIndex>(host);
  let index = record.childOrderIndex;
  if (!index) {
    const collected = new Map<string, Map<BlueprintNode, number>>();
    for (let position = 0; position < host.childEntries.length; position++) {
      const entry = host.childEntries[position];
      let templates = collected.get(entry.name);
      if (!templates) collected.set(entry.name, (templates = new Map()));
      if (!templates.has(entry.node)) templates.set(entry.node, position);
    }
    record.childOrderIndex = index = collected;
  }
  return index.get(name)?.get(template) ?? -1;
};
