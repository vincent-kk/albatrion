/**
 * Cleared in tree within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @param {*} node node input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function clearedInTree(context, root, node) {
  for (let n = node; n !== null; n = n.parent) if (root.cleared.has(n)) return true;
  return false;
}
