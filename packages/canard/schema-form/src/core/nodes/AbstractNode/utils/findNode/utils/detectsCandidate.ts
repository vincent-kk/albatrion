import type { SchemaNode } from '@/schema-form/core/nodes/type';

/**
 * Determines if a target node is a valid candidate during traversal based on variant matching.
 *
 * This function implements the core variant resolution logic for oneOf scenarios.
 * A variant represents a oneOf branch index, and nodes in different variants should
 * be isolated from each other to prevent incorrect cross-branch references.
 *
 * **Valid Candidate Logic:** Returns `true` (valid candidate) if ANY condition is met:
 * 1. Target node has no defined variant (not part of a oneOf branch)
 * 2. Target node's variant matches its parent's current oneOfIndex
 * 3. Source and target are in the same variant AND have the same parent node
 *
 * **Why Valid?** This allows traversal within the same oneOf branch or to unscoped nodes.
 * For example, if we're in oneOf branch 0 and find a node from the same branch, it's valid.
 * Nodes from different branches are considered invalid candidates.
 *
 * **Fallback Strategy:** When no valid candidates are found, the traversal function
 * uses the first found node as a fallback to ensure traversal doesn't fail completely.
 *
 * @param source - Source node being traversed from (provides variant context)
 * @param candidate - Target node being evaluated as a candidate
 * @returns `true` if target is a valid candidate, `false` if target should be skipped
 *
 * @example
 * ```ts
 * // Given a oneOf with two branches:
 * // Branch 0 (variant: 0): { name: string }
 * // Branch 1 (variant: 1): { name: number }
 *
 * // If source is in variant 0 and target is in variant 1:
 * detectsCandidate(sourceNode, targetNode) // returns false (not valid)
 *
 * // If both source and target are in variant 0:
 * detectsCandidate(sourceNode, targetNode) // returns true (valid candidate)
 * ```
 */
export const detectsCandidate = (source: SchemaNode, candidate: SchemaNode) =>
  candidate.variant === undefined ||
  candidate.variant === candidate.parentNode?.oneOfIndex ||
  (source.variant === candidate.variant &&
    source.parentNode === candidate.parentNode);
