/**
 * Leaf within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} name name input accepted by the regression model.
 * @param {*} defaultValue defaultValue input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function leaf(context, name, defaultValue) {
  const n = context.makeNode('leaf', name);
  n.defaultValue = defaultValue;
  return n;
}
