/**
 * Mark present within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function markPresent(context, node) {
  for (let n = node; n !== null && n.absent; n = n.parent) n.absent = false;
}
