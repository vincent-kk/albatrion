import { map as mapArray } from '@winglet/common-utils/array';

import type { BlueprintNode } from '../../../blueprint';
import { getHostDerived } from '../../../utils/cache/derivedRecords';

/** Immutable child-name indexes live only while their analyzed template lives. */

/**
 * Reuse declared child-name membership for writes and projected reads.
 * @param template - Immutable analyzed node shared by runtime occurrences
 * @returns Cached declared names; callers must not mutate this blueprint-owned index
 */
export const getDeclaredChildNames = (
  template: BlueprintNode,
): ReadonlySet<string> => {
  let names = getHostDerived<'declaredNames', ReadonlySet<string>>(
    template,
  ).declaredNames;
  if (!names) {
    names = new Set(mapArray(template.childEntries, (entry) => entry.name));
    getHostDerived<'declaredNames', ReadonlySet<string>>(
      template,
    ).declaredNames = names;
  }
  return names;
};
