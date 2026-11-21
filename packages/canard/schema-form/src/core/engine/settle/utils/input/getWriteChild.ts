import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';

/**
 * Select the declaration for a named input, preferring the live occurrence.
 * @param template - Parent declaration at this address
 * @param node - Selected parent, when this address has one
 * @param name - Unescaped input key
 * @returns Live occurrence and its declaration or the first matching slot declaration
 */
export const getWriteChild = <Self extends FieldNodeRecord<Self>>(
  template: BlueprintNode,
  node: Self | undefined,
  name: string,
) => {
  const children = node?.childrenByName;
  const child =
    children && hasOwnProperty(children, name) ? children[name] : undefined;
  const entry = template.childEntries.find(
    (entry) =>
      entry.name === name && (!child || entry.node === child.blueprintNode),
  );
  return { child, entry };
};
