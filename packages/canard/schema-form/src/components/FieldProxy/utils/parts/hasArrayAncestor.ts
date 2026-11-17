import type { FieldNode } from '@/schema-form/core';

/**
 * Check whether an immutable ancestor chain permits address changes by array rekeying.
 * @param node - Bound field whose parents retain their node kinds for its lifetime.
 * @returns Whether a parent, excluding the node itself, is an array.
 */
export const hasArrayAncestor = (node: FieldNode): boolean => {
  for (let parent = node.parentNode; parent; parent = parent.parentNode)
    if (parent.type === 'array') return true;
  return false;
};
