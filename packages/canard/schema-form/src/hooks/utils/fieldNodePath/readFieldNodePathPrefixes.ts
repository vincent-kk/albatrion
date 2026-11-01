import type { FieldNode } from '@/schema-form/core';
import {
  joinPointer,
  parsePointerSegments,
} from '@/schema-form/helpers/jsonPointer';

/** Find current containers through prefixes interpreted by the pointer owner.
 * @param root - Context root anchoring every prefix lookup.
 * @param path - Address accepted by root.find, including escaped names and wildcard operators.
 * @returns Distinct prefix matches through the first unresolved prefix, starting with the root. */
export const readFieldNodePathPrefixes = (
  root: FieldNode,
  path: string,
): readonly FieldNode[] => {
  const segments = parsePointerSegments(path);
  const nodes = [root];
  for (let length = 1; length <= segments.length; length++) {
    const node = root.find(joinPointer(segments.slice(0, length)));
    if (!node) break;
    if (nodes.indexOf(node) < 0) nodes.push(node);
  }
  return nodes;
};
