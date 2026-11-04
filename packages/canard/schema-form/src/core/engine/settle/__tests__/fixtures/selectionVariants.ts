import type { DispatchTestNode } from '../../../__tests__/fixtures/createDispatchTree';

/**
 * Selections to compare for one node: the committed fallback, then each of the node's
 * and its parent's full declaration lists with every single declaration left out once.
 * @param node - Target whose layers are compared
 * @returns Selection maps passed unchanged to both implementations
 */
export const selectionVariants = (
  node: DispatchTestNode,
): Map<DispatchTestNode, readonly number[]>[] => {
  const variants = [new Map<DispatchTestNode, readonly number[]>()];
  for (const owner of node.parent ? [node, node.parent] : [node]) {
    const ids = owner.blueprintNode.declarations.map(({ id }) => id);
    variants.push(new Map([[owner, ids]]));
    for (const left of ids)
      variants.push(new Map([[owner, ids.filter((id) => id !== left)]]));
  }
  return variants;
};
