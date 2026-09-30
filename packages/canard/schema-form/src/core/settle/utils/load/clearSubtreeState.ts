import type { SchemaNodeRecord } from '../../../record';

/**
 * Begin a load lifetime by clearing interaction flags in its own subtree.
 * @param node - Live root of the scope being loaded
 * @returns Nothing; sibling state remains untouched
 */
export const clearSubtreeState = <Self extends SchemaNodeRecord<Self>>(node: Self): void => {
  node.state = {};
  for (const child of node.children ?? []) clearSubtreeState(child);
};
