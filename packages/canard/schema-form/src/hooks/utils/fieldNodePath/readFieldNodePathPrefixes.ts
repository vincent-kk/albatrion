import type { FieldNode } from '@/schema-form/core';
import { stripFragment } from '@/schema-form/helpers/jsonPointer';

/** Find each current container visited by a raw path without changing its pointer syntax.
 * @param root - Context root anchoring every prefix lookup.
 * @param path - Address accepted by root.find, including escaped names and wildcard operators.
 * @returns Distinct prefix matches through the first unresolved prefix, starting with the root. */
export const readFieldNodePathPrefixes = (
  root: FieldNode,
  path: string,
): readonly FieldNode[] => {
  const pointer = stripFragment(path);
  const nodes = [root];
  for (
    let index = pointer[0] === '/' ? 1 : 0;
    index <= pointer.length;
    index++
  ) {
    if (index !== pointer.length && pointer[index] !== '/') continue;
    const node = root.find(pointer.slice(0, index));
    if (!node) break;
    if (nodes.indexOf(node) < 0) nodes.push(node);
  }
  return nodes;
};
