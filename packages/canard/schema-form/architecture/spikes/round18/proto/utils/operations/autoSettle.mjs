/**
 * Auto settle within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function autoSettle(context, node) {
  if (context.batchDepth > 0 || context.stagingDepth > 0) return;
  const root = node.root;
  if (root.dirty) context.settle(root);
}
