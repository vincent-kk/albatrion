import type { SchemaNode } from '@/schema-form/core';
import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import { detectsCandidate } from './utils/detectsCandidate';
import { getSegments } from './utils/getSegments';

/**
 * Finds a single node in the schema node tree that matches the given path segments.
 *
 * This function implements variant-aware traversal for oneOf scenarios where multiple nodes
 * can share the same propertyKey but exist in different variants (oneOf branches).
 *
 * **Scope Resolution Logic:**
 * - When multiple child nodes match the same propertyKey, variant filtering is applied
 * - The `detectsCandidate` function checks if the candidate node shares the same oneOf scope as the source
 * - Priority is given to nodes where `detectsCandidate(source, node)` returns `true` (same variant scope)
 * - If no matching nodes pass the scope check, the first found node is used as fallback
 *
 * **Special Path Segments:**
 * - `JSONPointer.Fragment` - Navigate to root node (`#`)
 * - `JSONPointer.Parent` - Navigate to parent node (`..`)
 * - `JSONPointer.Current` - Reset cursor to source node (`.`)
 * - Regular segments - Match against node's name
 *
 * **Traversal Behavior:**
 * - Stops traversal at terminal nodes (leaf nodes with no subnodes)
 * - Returns null if path cannot be resolved
 * - Uses tentative matching with fallback for variant conflicts
 *
 * @param source - The starting node for traversal (used for variant comparison)
 * @param pointer - JSON Pointer path string, array of segments, or null
 * @returns The found node or null if path is invalid or node doesn't exist
 *
 * @example
 * ```ts
 * // Navigate to nested property
 * const node = findNode(rootNode, ["user", "profile", "name"]);
 *
 * // Navigate with array index
 * const arrayItem = findNode(rootNode, ["items", "0", "title"]);
 *
 * // Navigate to parent then specific child
 * const sibling = findNode(currentNode, [JSONPointer.Parent, "sibling"]);
 * ```
 */
export const findNode = (
  source: SchemaNode,
  pointer: string | string[] | null,
): SchemaNode | null => {
  if (!source) return null;
  if (pointer === null) return source;
  const segments = typeof pointer === 'string' ? getSegments(pointer) : pointer;
  if (segments.length === 0) return source;

  let cursor = source;
  for (let i = 0, il = segments.length; i < il; i++) {
    const segment = segments[i];
    if (segment === $.Fragment) {
      cursor = cursor.rootNode;
      if (!cursor) return null;
    } else if (segment === $.Parent) {
      cursor = cursor.parentNode!;
      if (!cursor) return null;
    } else if (segment === $.Current) {
      // Do Not Change Cursor
      // Keep the current cursor
    } else {
      if (cursor.group === 'terminal') return null;
      const subnodes = cursor.subnodes;
      if (!subnodes?.length) return null;
      let tentative = true;
      let fallback: SchemaNode | null = null;
      for (let j = 0, jl = subnodes.length; j < jl; j++) {
        const node = subnodes[j].node;
        if (node.escapedName !== segment) continue;
        if (fallback === null) fallback = node;
        if (detectsCandidate(source, node)) {
          tentative = false;
          cursor = node;
          break;
        }
      }
      if (tentative)
        if (fallback) cursor = fallback;
        else return null;
      if (cursor.group === 'terminal') return cursor;
    }
  }
  return cursor;
};
