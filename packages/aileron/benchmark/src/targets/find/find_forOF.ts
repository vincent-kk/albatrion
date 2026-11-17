import { JSONPath } from '@winglet/json/path';

import type { FieldNode } from '@/schema-form/core';

/**
 * Finds a node by JSONPath segments in a FieldNode tree.
 * @param target - Node at which traversal starts; null returns null.
 * @param segments - Ordered JSONPath segments, including root or parent markers.
 * @returns Matching node, or null when a segment cannot be resolved.
 */
export const find = (
  target: FieldNode | null,
  segments: string[],
): FieldNode | null => {
  if (!target) return null;
  if (!segments.length) return target as FieldNode;
  let cursor = target as FieldNode;
  for (const segment of segments) {
    if (segment === JSONPath.Root) {
      cursor = cursor.rootNode;
      if (!cursor) return null;
    } else if (segment === JSONPath.Current) {
      cursor = cursor.parentNode!;
      if (!cursor) return null;
    } else {
      const children = cursor.children;
      if (!children?.length) return null;
      let found = false;
      for (const child of children) {
        if (child.name !== segment) continue;
        cursor = child;
        found = true;
        break;
      }
      if (!found) return null;
    }
  }
  return cursor;
};
