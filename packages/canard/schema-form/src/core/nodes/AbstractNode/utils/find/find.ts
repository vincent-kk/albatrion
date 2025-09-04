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

  let cursor = source;
  for (let i = 0, il = segments.length; i < il; i++) {
    const segment = segments[i];
    if (segment === JSONPointer.Fragment) {
      cursor = cursor.rootNode;
      if (!cursor) return null;
    } else if (segment === JSONPointer.Parent) {
      cursor = cursor.parentNode!;
      if (!cursor) return null;
    } else if (segment === JSONPointer.Current) {
      cursor = source;
    } else {
      if (cursor.group === 'terminal') return null;
      const subnodes = cursor.subnodes;
      if (!subnodes?.length) return null;
      let tentative = true;
      let fallback: SchemaNode | null = null;
      for (let j = 0, jl = subnodes.length; j < jl; j++) {
        const node = subnodes[j].node;
        if (node.propertyKey !== segment) continue;
        fallback = node;
        if (next(source, node)) continue;
        cursor = node;
        tentative = false;
        break;
      }
      if (tentative)
        if (fallback) cursor = fallback;
        else return null;
      if (cursor.group === 'terminal') return cursor;
    }
  }
  return cursor;
};

/**
 * Check if target node should be skipped
 * @note This function returns `true` if ALL of the following conditions are met:
 *  - Target node has a scope (not undefined)
 *  - Target node's scope differs from its parent's oneOfIndex
 *  - Either source and target nodes have different namespaces OR different parent nodes
 * @param source - Source node (assumed to have a scope)
 * @param target - Target node to evaluate
 * @returns `true` if the target node should be skipped, `false` otherwise
 */
const next = (source: SchemaNode, target: SchemaNode) =>
  target.scope !== undefined &&
  target.scope !== target.parentNode?.oneOfIndex &&
  (source.scope !== target.scope || source.parentNode !== target.parentNode);
