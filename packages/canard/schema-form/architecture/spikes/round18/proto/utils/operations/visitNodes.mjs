/**
 * Visit nodes within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @param {*} fn fn input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function visitNodes(context, node, fn) {
  fn(node);
  for (const child of node.children ?? []) context.visitNodes(child, fn);
}
