/**
 * Is detached within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @param {*} root root input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function isDetached(context, node, root) {
  let n = node;
  while (n.parent !== null) n = n.parent;
  return n !== root;
}
