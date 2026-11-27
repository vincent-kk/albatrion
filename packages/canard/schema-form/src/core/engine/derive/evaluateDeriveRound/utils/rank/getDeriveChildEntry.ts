import type { BlueprintNode } from '../../../../blueprint';
import { getHostDerived } from '../../../../utils/cache/derivedRecords';

/** Immutable template indexes are built once when a rule first uses the host. */

/**
 * Find a declared child without rescanning a wide host on every injection.
 * @param parent - Immutable analyzed host template
 * @param name - Decoded direct child name
 * @param template - Optional live blueprint node for a same-name declaration
 * @returns First matching edge and its document position
 */
export const getDeriveChildEntry = (
  parent: BlueprintNode,
  name: string,
  template?: BlueprintNode,
) => {
  let index = getHostDerived<
    'deriveChildren',
    ReadonlyMap<string, readonly number[]>
  >(parent).deriveChildren;

  if (!index) {
    const built = new Map<string, number[]>();

    const childEntries = parent.childEntries;
    for (
      let position = 0, count = childEntries.length;
      position < count;
      position++
    ) {
      const entry = childEntries[position];

      const positions = built.get(entry.name) ?? [];
      positions.push(position);
      built.set(entry.name, positions);
    }

    index = built;
    getHostDerived<'deriveChildren', ReadonlyMap<string, readonly number[]>>(
      parent,
    ).deriveChildren = index;
  }
  const positions = index.get(name);
  const position = template
    ? positions?.find(
        (candidate) => parent.childEntries[candidate].node === template,
      )
    : positions?.[0];
  return position === undefined
    ? undefined
    : { entry: parent.childEntries[position], position };
};
