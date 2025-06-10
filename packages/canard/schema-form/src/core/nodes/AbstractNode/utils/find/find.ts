import type { SchemaNode } from '@/schema-form/core';
import { JSONPointer } from '@/schema-form/helpers/jsonPointer';

/**
 * Finds a node in the AbstractNode tree that matches the given path.
 * @param target - Root node to start searching from
 * @param segments - Array of path segments to find (e.g. ["root", "child", "0", "grandchild"])
 * @returns Found node or null
 */
export const find = (
  target: SchemaNode,
  segments: string[] | null,
): SchemaNode | null => {
  if (!target) return null;
  if (!segments?.length) return target;
  const current = target;
  let cursor = current;
  for (let i = 0; i < segments.length; i++) {
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
      const children = cursor.children;
      if (!children?.length) return null;
      let found = false;
      for (const child of children) {
        if (child.node.propertyKey !== segment) continue;
        if (child.node.group === 'terminal') return child.node;
        cursor = child.node;
        found = true;
        break;
      }
      if (!found) return null;
    }
  }
  return cursor;
};
