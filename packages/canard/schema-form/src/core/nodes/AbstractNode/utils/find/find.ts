import type { SchemaNode } from '@/schema-form/core';
import { JSONPointer } from '@/schema-form/helpers/jsonPointer';

/**
 * Finds a node in the AbstractNode tree that matches the given path.
 * @param source - Root node to start searching from
 * @param segments - Array of path segments to find (e.g. ["root", "child", "0", "grandchild"])
 * @returns Found node or null
 */
export const find = (
  source: SchemaNode,
  segments: string[] | null,
): SchemaNode | null => {
  if (!source) return null;
  if (!segments?.length) return source;
  const current = source;
  let cursor = current;
  for (let i = 0, il = segments.length; i < il; i++) {
    const segment = segments[i];
    if (segment === JSONPointer.Fragment) {
      cursor = cursor.rootNode;
      if (!cursor) return null;
    } else if (segment === JSONPointer.Parent) {
      cursor = cursor.parentNode!;
      if (!cursor) return null;
    } else if (segment === JSONPointer.Current) {
      cursor = current;
    } else {
      if (cursor.group === 'terminal') return null;
      const subnodes = cursor.subnodes;
      if (!subnodes?.length) return null;
      let found = false;
      for (let j = 0, jl = subnodes.length; j < jl; j++) {
        const node = subnodes[j].node;
        if (node.propertyKey !== segment) continue;
        if (node.group === 'terminal') return node;
        cursor = node;
        found = true;
        break;
      }
      if (!found) return null;
    }
  }
  return cursor;
};
