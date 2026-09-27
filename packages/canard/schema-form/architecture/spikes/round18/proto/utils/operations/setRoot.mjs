/**
 * Set root within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @param {*} root root input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function setRoot(context, node, root) {
  node.root = root;
  const kids = node.children;
  if (kids === null) return;
  for (let i = 0; i < kids.length; i++) context.setRoot(kids[i], root);
}
