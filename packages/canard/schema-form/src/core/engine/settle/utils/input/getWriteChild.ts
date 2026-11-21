import { hasOwnProperty } from '@winglet/common-utils/lib';

import { getItemEntries } from '../../../blueprint';
import type { BlueprintChildEntry, BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { getHostDerived } from '../../../utils/cache/derivedRecords';

/**
 * Select the declaration for an input address, preferring the live occurrence.
 * @param template - Parent declaration at this address
 * @param node - Selected parent, when this address has one
 * @param key - Unescaped object key or array index
 * @returns The occurrence and first or selected declaration, including array ambiguity
 */
export const getWriteChild = <Self extends FieldNodeRecord<Self>>(
  template: BlueprintNode,
  node: Self | undefined,
  key: string | number,
) => {
  const children = node?.childrenByName;
  const child =
    children && hasOwnProperty(children, key) ? children[key] : undefined;
  if (typeof key === 'number') {
    const entries = getItemEntries(template, key);
    return {
      child,
      entry:
        child && child.blueprintNode !== entries[0]?.node
          ? (entries.find(({ node }) => node === child.blueprintNode) ??
            entries[0])
          : entries[0],
      isAmbiguous: entries.length > 1,
    };
  }
  const derived = getHostDerived<
    'objectChildren',
    ReadonlyMap<string, BlueprintChildEntry>
  >(template);
  let entries = derived.objectChildren;
  if (!entries) {
    const first = new Map<string, BlueprintChildEntry>();
    for (const entry of template.childEntries)
      if (!first.has(entry.name)) first.set(entry.name, entry);
    derived.objectChildren = entries = first;
  }
  const first = entries.get(key);
  const entry =
    child && first?.node !== child.blueprintNode
      ? (template.childEntries.find(
          (entry) => entry.name === key && entry.node === child.blueprintNode,
        ) ?? first)
      : first;
  return { child, entry, isAmbiguous: false };
};
