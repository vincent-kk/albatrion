/**
 * Is ancestor within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} a a input accepted by the regression model.
 * @param {*} n n input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function isAncestor(context, a, n) {
  for (let p = n.parent; p !== null; p = p.parent) if (p === a) return true;
  return false;
}
