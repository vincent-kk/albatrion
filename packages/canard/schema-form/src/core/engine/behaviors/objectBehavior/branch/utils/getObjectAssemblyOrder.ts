import type { BlueprintNode } from '../../../../blueprint';
import { getHostDerived } from '../../../../utils/cache/derivedRecords';

/**
 * Retain each name's first declaration rank in the engine-owned weak template memo.
 * @param host - Immutable completed host blueprint, including candidate entries
 * @returns Shared first-name ranks; populates its host memo on first use
 */
export const getObjectAssemblyOrder = (
  host: BlueprintNode,
): ReadonlyMap<string, number> => {
  const record = getHostDerived<
    'objectAssemblyOrder',
    ReadonlyMap<string, number>
  >(host);
  if (record.objectAssemblyOrder) return record.objectAssemblyOrder;
  const order = new Map<string, number>();
  for (let index = 0; index < host.childEntries.length; index++) {
    const name = host.childEntries[index].name;
    if (!order.has(name)) order.set(name, index);
  }
  record.objectAssemblyOrder = order;
  return order;
};
