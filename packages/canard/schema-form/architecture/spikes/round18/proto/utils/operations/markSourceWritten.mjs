/**
 * Mark source written within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function markSourceWritten(context, node) {
  node.srcWritten = true;
}
