import type { SchemaNode } from '@/schema-form/core';
import { JSONPointer } from '@/schema-form/helpers/jsonPointer';

/**
 * Traverses the schema node tree to find a node that matches the given path segments.
 *
 * This function implements scope-aware traversal for oneOf scenarios where multiple nodes
 * can share the same propertyKey but exist in different scopes (oneOf branches).
 *
 * **Scope Resolution Logic:**
 * - When multiple child nodes match the same propertyKey, scope filtering is applied
 * - The `next` function determines if a node should be skipped based on scope mismatch
 * - Priority is given to nodes where `next(source, node)` returns `false` (scope match)
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
 * - Uses tentative matching with fallback for scope conflicts
 *
 * @param source - The starting node for traversal (used for scope comparison)
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
        if (node.name !== segment) continue;
        if (fallback === null) fallback = node;
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
 * Determines if a target node should be skipped during traversal based on scope mismatch.
 *
 * This function implements the core scope resolution logic for oneOf scenarios.
 * A scope represents a oneOf branch index, and nodes in different scopes should
 * be isolated from each other to prevent incorrect cross-branch references.
 *
 * **Skip Logic:** Returns `true` (skip node) if ALL conditions are met:
 * 1. Target node has a defined scope (is part of a oneOf branch)
 * 2. Target node's scope differs from its parent's current oneOfIndex
 * 3. Source and target are in different scopes OR have different parent nodes
 *
 * **Why Skip?** This prevents traversal from crossing oneOf boundaries inappropriately.
 * For example, if we're in oneOf branch 0 but find a node from branch 1, we should
 * skip it unless we're explicitly navigating to that branch.
 *
 * **Fallback Strategy:** When all matching nodes are skipped, the traversal function
 * uses the first found node as a fallback to ensure traversal doesn't fail completely.
 *
 * @param source - Source node being traversed from (provides scope context)
 * @param target - Target node being evaluated for skipping
 * @returns `true` if target should be skipped, `false` if target is valid for traversal
 *
 * @example
 * ```ts
 * // Given a oneOf with two branches:
 * // Branch 0 (scope: 0): { name: string }
 * // Branch 1 (scope: 1): { name: number }
 *
 * // If source is in scope 0 and target is in scope 1:
 * next(sourceNode, targetNode) // returns true (skip)
 *
 * // If both source and target are in scope 0:
 * next(sourceNode, targetNode) // returns false (don't skip)
 * ```
 */
const next = (source: SchemaNode, target: SchemaNode) =>
  target.scope !== undefined &&
  target.scope !== target.parentNode?.oneOfIndex &&
  (source.scope !== target.scope || source.parentNode !== target.parentNode);
