/**
 * Publish within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @param {*} sid sid input accepted by the regression model.
 * @param {*} local local input accepted by the regression model.
 * @param {*} emit emit input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function publish(context, node, sid, local, emit) {
  node.nextLocal = local;
  node.nextEmit = emit;
  node.stamp = sid;
}
