import type { SchemaNode } from '@/schema-form/core';
import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import { getSegments } from './utils/getSegments';

/**
 * Finds all nodes in the schema node tree that match the given path segments.
 *
 * Unlike `findNode` which returns a single node with variant-aware filtering,
 * this function returns all nodes that match the path regardless of their variant or scope.
 * This is useful for oneOf/anyOf scenarios where multiple nodes can share the same
 * data path but exist in different branches.
 *
 * **Deduplication:**
 * - Results are deduplicated to ensure each node instance appears only once
 * - Even if the same node can be reached through multiple paths, it will only be included once
 *
 * **Special Path Segments (Access Modifiers):**
 * - `JSONPointer.Fragment` (`#`) - Navigate to root node (all cursors share same root)
 * - `JSONPointer.Parent` (`..`) - Navigate each cursor to its parent node (deduplicated)
 * - `JSONPointer.Current` (`.`) - Keep current cursors unchanged
 * - Regular segments - Match against each cursor's subnodes by escapedName
 *
 * **Terminal Node Handling:**
 * - Terminal nodes cannot be traversed further (no subnodes)
 * - When a terminal node is encountered during traversal, it remains in the result set
 * - Terminal nodes are preserved through subsequent segments until path resolution completes
 *
 * **Traversal Behavior:**
 * - Collects all matching subnodes at each segment (no variant filtering)
 * - Returns empty array if no paths can be resolved
 *
 * @param source - The starting node for traversal
 * @param pointer - JSON Pointer path string, array of segments, or null
 * @returns Array of all matching nodes (empty if none found)
 *
 * @example
 * ```ts
 * // Given a oneOf schema with two branches both having "name" property:
 * // Branch 0: { name: StringNode }
 * // Branch 1: { name: StringNode }
 *
 * // Returns both "name" nodes from different branches
 * const nodes = findNodes(rootNode, ["name"]);
 * // nodes.length === 2
 *
 * // Terminal node preservation: if "child" is terminal, it stays in result
 * const result = findNodes(root, ["child", "nonexistent"]);
 * // result === [childNode] (terminal preserved)
 *
 * // Navigate via special segments
 * findNodes(someNode, ["#", "data"]);  // root → data
 * findNodes(someNode, ["..", "sibling"]);  // parent → sibling
 * findNodes(someNode, [".", "child"]);  // stay → child
 * ```
 */
export const findNodes = (
  source: SchemaNode,
  pointer: string | string[] | null,
): SchemaNode[] => {
  if (!source) return [];
  if (pointer === null) return [source];

  const segments = typeof pointer === 'string' ? getSegments(pointer) : pointer;
  if (segments.length === 0) return [source];

  let cursors: SchemaNode[] = [source];
  let nextCursors: SchemaNode[] = [];

  for (let i = 0, il = segments.length; i < il; i++) {
    const segment = segments[i];
    if (segment === $.Fragment) {
      const rootNode = cursors[0]?.rootNode;
      if (rootNode) nextCursors = [rootNode];
    } else if (segment === $.Parent) {
      nextCursors = [];
      for (let j = 0, jl = cursors.length; j < jl; j++) {
        const parentNode = cursors[j].parentNode;
        if (parentNode && nextCursors.indexOf(parentNode) === -1)
          nextCursors.push(parentNode);
      }
    } else if (segment === $.Current) {
      nextCursors = cursors;
    } else {
      nextCursors = [];
      const isWildcard = segment === $.Wildcard;
      for (let j = 0, jl = cursors.length; j < jl; j++) {
        const cursor = cursors[j];
        if (cursor.group === 'terminal') {
          if (nextCursors.indexOf(cursor) === -1) nextCursors.push(cursor);
        } else {
          const subnodes = cursor.subnodes;
          if (!subnodes?.length) continue;
          for (let k = 0, kl = subnodes.length; k < kl; k++) {
            const node = subnodes[k].node;
            if (
              (isWildcard || node.escapedName === segment) &&
              nextCursors.indexOf(node) === -1
            )
              nextCursors.push(node);
          }
        }
      }
    }
    if (nextCursors.length === 0) return [];
    cursors = nextCursors;
  }
  return cursors;
};
