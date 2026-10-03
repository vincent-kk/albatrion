/**
 * Path of within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function pathOf(context, node) {
  const parts = [];
  for (let n = node; n.parent !== null; n = n.parent) parts.push(n.name);
  return `/${parts.reverse().join('/')}`;
}
