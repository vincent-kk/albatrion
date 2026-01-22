import type { Fn } from '@aileron/declare';

import type { AbstractNode } from '../../AbstractNode';

/**
 * Traverses the node tree in breadth-first order.
 * @param node - The starting node to traverse from
 * @param visitor - The visitor function to call for each node
 * @returns void
 */
export const breadthFirstSearch = (
  node: AbstractNode,
  visitor: Fn<[node: AbstractNode]>,
) => {
  const queue: AbstractNode[] = [node];
  for (let head = 0; head < queue.length; head++) {
    const current = queue[head];
    visitor(current);
    const nodes = current.subnodes;
    if (nodes?.length)
      for (let i = 0, e = nodes[0], l = nodes.length; i < l; i++, e = nodes[i])
        queue.push(e.node);
  }
};
