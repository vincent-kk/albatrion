/**
 * Publish host within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @param {*} sid sid input accepted by the regression model.
 * @param {*} L L input accepted by the regression model.
 * @param {*} nonObject nonObject input accepted by the regression model.
 * @param {*} raw raw input accepted by the regression model.
 * @param {*} status status input accepted by the regression model.
 * @param {*} sweeps sweeps input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function publishHost(context, node, sid, L, nonObject, raw, status, sweeps) {
  const s = node.nextSettle;
  s.status = status;
  s.sweeps = sweeps;
  const emit = nonObject ? raw : node.nextLocalKeys.length === 0 && node.schema?.options?.omitEmpty !== false ? context.MISSING : L;
  context.publish(node, sid, L, emit);
}
