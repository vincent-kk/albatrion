/**
 * Count the independently bounded gate and node-gate transition opportunities.
 * @param {object} context Runtime exposing structural traversal and control lookup.
 * @param {object} root Prototype tree with statically registered gates.
 * @returns {number} Gate-bearing fragment count plus node-gate count plus one.
 */
export function countTransitionBudget(context, root) {
  let count = 1;
  context.visitNodes(root, node => {
    count += node.fragments?.filter(fragment => fragment.guard !== null).length ?? 0;
    if (context.controlOption(node.schema, 'active') !== undefined) count++;
  });
  return count;
}
