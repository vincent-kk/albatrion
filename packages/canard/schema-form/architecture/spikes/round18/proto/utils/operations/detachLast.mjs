/**
 * Detach last within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function detachLast(context, node) {
  const child = node.children.pop();
  child.detached = true;
  child.parent = null;
}
