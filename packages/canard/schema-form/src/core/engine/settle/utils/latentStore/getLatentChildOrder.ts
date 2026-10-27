import type { BlueprintNode } from '../../../blueprint';
import { getHostDerived } from '../../../utils/cache/derivedRecords';

/**
 * Read the first named edge position from an immutable host's lazy index.
 * @param host - Declaration parent, including reusable recursive templates
 * @param name - Actual occurrence name; repeated items use their numeric position
 * @param template - Candidate template at this edge
 * @returns The same position as the first matching childEntries edge
 */
export const getLatentChildOrder = (
  host: BlueprintNode,
  name: string,
  template: BlueprintNode,
): number => {
  const derived = getHostDerived<
    'latentEntryOrder',
    Map<string, Map<BlueprintNode, number>>
  >(host);
  let order = derived.latentEntryOrder;
  if (!order) {
    order = new Map();
    for (let index = 0; index < host.childEntries.length; index++) {
      const entry = host.childEntries[index];
      let candidates = order.get(entry.name);
      if (!candidates) order.set(entry.name, (candidates = new Map()));
      if (!candidates.has(entry.node)) candidates.set(entry.node, index);
    }
    derived.latentEntryOrder = order;
  }
  const index = order.get(name)?.get(template);
  if (index !== undefined) return index;
  const position = Number(name);
  return Number.isInteger(position) && position >= 0 ? position : 0;
};
