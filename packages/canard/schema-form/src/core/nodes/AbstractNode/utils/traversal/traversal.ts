import type { SchemaNode } from '@/schema-form/core';
import { JSONPointer } from '@/schema-form/helpers/jsonPointer';

import { detectsCandidate } from './utils/detectsCandidate';
import { getSegments } from './utils/getSegments';

/**
 * Traverses the schema node tree to find a node that matches the given path segments.
 *
 * This function implements variant-aware traversal for oneOf scenarios where multiple nodes
 * can share the same propertyKey but exist in different variants (oneOf branches).
 *
 * **Scope Resolution Logic:**
 * - When multiple child nodes match the same propertyKey, variant filtering is applied
 * - The `next` function determines if a node should be skipped based on variant mismatch
 * - Priority is given to nodes where `next(source, node)` returns `false` (variant match)
 * - If all matching nodes return `true` from `next`, the first found node is used as fallback
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
 * @param segments - Array of path segments to traverse (e.g. ["user", "address", "0", "street"])
 * @returns The found node or null if path is invalid or node doesn't exist
 *
 * @example
 * ```ts
 * // Navigate to nested property
 * const node = traversal(rootNode, ["user", "profile", "name"]);
 *
 * // Navigate with array index
 * const arrayItem = traversal(rootNode, ["items", "0", "title"]);
 *
 * // Navigate to parent then specific child
 * const sibling = traversal(currentNode, [JSONPointer.Parent, "sibling"]);
 * ```
 */
export const traversal = (
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
    if (segment === $F) {
      cursor = cursor.rootNode;
      if (!cursor) return null;
    } else if (segment === $P) {
      cursor = cursor.parentNode!;
      if (!cursor) return null;
    } else if (segment === $C) {
      cursor = source;
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

const $F = JSONPointer.Fragment;
const $P = JSONPointer.Parent;
const $C = JSONPointer.Current;
