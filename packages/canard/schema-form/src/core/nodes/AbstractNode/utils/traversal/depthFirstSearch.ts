import type { Fn } from '@aileron/declare';

import type { AbstractNode } from '../../AbstractNode';

/**
 * Traverses the node tree in depth-first order.
 * @param node - The starting node to traverse from
 * @param visitor - The visitor function to call for each node
 * @param postOrder - Whether to visit the node in post-order (true) or pre-order (false). Defaults to true.
 * @returns void
 */
export const depthFirstSearch = (
  node: AbstractNode,
  visitor: Fn<[node: AbstractNode]>,
  postOrder: boolean = true,
) => {
  if (postOrder === false) visitor(node);
  const nodes = node.subnodes;
  if (nodes?.length)
    for (let i = 0, e = nodes[0], l = nodes.length; i < l; i++, e = nodes[i])
      depthFirstSearch(e.node, visitor, postOrder);
  if (postOrder === true) visitor(node);
};
