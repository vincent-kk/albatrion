import type { Nullable } from '@aileron/declare';

import { type FieldNode, FieldNodeState } from '@/schema-form/core';

/**
 * Whether a node's own state lets it take the native-submit focus.
 * @param node - Node visited under present ancestors.
 * @returns True when it has its own errors, is neither disabled nor read-only, and does not set its
 *   own ErrorVisible to false (the renderer lets that value win over every policy).
 */
const isFocusCandidate = (node: FieldNode): boolean =>
  node.errors.length > 0 &&
  !node.isDisabled &&
  !node.isReadOnly &&
  node.state?.[FieldNodeState.ErrorVisible] !== false;

/**
 * Choose the node that an invalid native submit focuses, from node state alone.
 *
 * Preorder, skipping every node that is not present together with its subtree. The root is chosen
 * only when no other node qualifies, because its container is the whole form and its first input
 * may be unrelated to the errors. Whether the chosen node's input can take focus is not checked:
 * the result follows tree order predictably and never moves on to a later candidate.
 * @param root - Current root of the form.
 * @returns The first candidate below the root, else the root when it qualifies, else null. Worst
 *   case visits every node once.
 */
export const findFirstInvalidNode = (root: FieldNode): Nullable<FieldNode> => {
  let found: Nullable<FieldNode> = null;
  root.visitSubtree((node) => {
    if (found || !node.isPresent) return false;
    if (node !== root && isFocusCandidate(node)) found = node;
    return true;
  });
  if (found) return found;
  return root.isPresent && isFocusCandidate(root) ? root : null;
};
