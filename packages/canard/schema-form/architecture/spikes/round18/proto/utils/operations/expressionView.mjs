/**
 * Expression view within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function expressionView(context, root) {
  return context.stagedTree(root);
}
