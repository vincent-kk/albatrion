/**
 * Staged tree within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function stagedTree(context, node) {
  if (node.kind === 'leaf' || context.rawOf(node) !== undefined) return context.rawOf(node);
  if (node.kind === 'array') return node.children.map(context.stagedTree);
  const value = {};
  for (const child of node.children) {
    const v = context.stagedTree(child);
    if (v !== undefined) value[child.name] = v;
  }
  return Object.assign(value, context.extrasOf(node));
}
