import type { Dictionary } from '@aileron/declare';

import type { BlueprintChildEntry, BlueprintNode } from '../../../../blueprint';
import { getHostDerived } from '../../../../utils/cache/derivedRecords';

/** Property enumeration order is shared by every occurrence of a static template. */

/**
 * Preserve the generic structure's integer-name order without reselecting shape.
 * @param template - Proven ungated object template
 * @returns Stable entries in Object.values property order
 */
export const getStaticObjectEntries = (
  template: BlueprintNode,
): readonly BlueprintChildEntry[] => {
  const cached = getHostDerived<
    'staticObjectEntries',
    readonly BlueprintChildEntry[]
  >(template).staticObjectEntries;
  if (cached) return cached;
  const byName: Dictionary<BlueprintChildEntry> = Object.create(null);
  const entries = template.childEntries;
  for (let index = 0; index < entries.length; index++)
    byName[entries[index].name] = entries[index];
  const result = Object.freeze(Object.values(byName));
  getHostDerived<'staticObjectEntries', readonly BlueprintChildEntry[]>(
    template,
  ).staticObjectEntries = result;
  return result;
};
