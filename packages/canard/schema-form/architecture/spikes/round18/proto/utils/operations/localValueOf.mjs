/**
 * Local value of within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function localValueOf(context, node) {
  return node.local === context.MISSING ? undefined : node.local;
}
