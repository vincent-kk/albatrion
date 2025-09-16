import type { SchemaNode } from '@/schema-form/core/nodes/type';

/**
 * Determines if a target node is a valid candidate during traversal based on scope matching.
 *
 * This function implements the core scope resolution logic for oneOf scenarios.
 * A scope represents a oneOf branch index, and nodes in different scopes should
 * be isolated from each other to prevent incorrect cross-branch references.
 *
 * **Valid Candidate Logic:** Returns `true` (valid candidate) if ANY condition is met:
 * 1. Target node has no defined scope (not part of a oneOf branch)
 * 2. Target node's scope matches its parent's current oneOfIndex
 * 3. Source and target are in the same scope AND have the same parent node
 *
 * **Why Valid?** This allows traversal within the same oneOf branch or to unscoped nodes.
 * For example, if we're in oneOf branch 0 and find a node from the same branch, it's valid.
 * Nodes from different branches are considered invalid candidates.
 *
 * **Fallback Strategy:** When no valid candidates are found, the traversal function
 * uses the first found node as a fallback to ensure traversal doesn't fail completely.
 *
 * @param source - Source node being traversed from (provides scope context)
 * @param candidate - Target node being evaluated as a candidate
 * @returns `true` if target is a valid candidate, `false` if target should be skipped
 *
 * @example
 * ```ts
 * // Given a oneOf with two branches:
 * // Branch 0 (scope: 0): { name: string }
 * // Branch 1 (scope: 1): { name: number }
 *
 * // If source is in scope 0 and target is in scope 1:
 * detectsCandidate(sourceNode, targetNode) // returns false (not valid)
 *
 * // If both source and target are in scope 0:
 * detectsCandidate(sourceNode, targetNode) // returns true (valid candidate)
 * ```
 */
export const detectsCandidate = (source: SchemaNode, candidate: SchemaNode) =>
  candidate.scope === undefined ||
  candidate.scope === candidate.parentNode?.oneOfIndex ||
  (source.scope === candidate.scope &&
    source.parentNode === candidate.parentNode);
