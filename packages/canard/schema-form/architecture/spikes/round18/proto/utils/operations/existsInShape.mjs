/**
 * Exists in shape within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function existsInShape(context, node) {
  for (let n = node; n !== null; n = n.parent) {
    if (n.conditional && !n.actNext) return false;
    if (context.SWITCHES.NODE_GATE_UNIT === 'shape' && n.controlNext?.active === false) return false;
  }
  return true;
}
