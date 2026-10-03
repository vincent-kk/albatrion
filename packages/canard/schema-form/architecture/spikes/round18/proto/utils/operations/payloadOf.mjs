/**
 * Payload of within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @param {*} prevLocal prevLocal input accepted by the regression model.
 * @param {*} prevEmit prevEmit input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function payloadOf(context, node, prevLocal, prevEmit) {
  const cur = node.kind === 'leaf' ? context.valueOrUndefined(node.emit) : {
    local: context.valueOrUndefined(node.local),
    emit: context.valueOrUndefined(node.emit)
  };
  const prev = node.kind === 'leaf' ? context.valueOrUndefined(prevEmit) : {
    local: context.valueOrUndefined(prevLocal),
    emit: context.valueOrUndefined(prevEmit)
  };
  return {
    previous: prev,
    current: cur,
    refresh: (node.signals & context.REFRESH) !== 0,
    settle: node.settle === null ? undefined : {
      ...node.settle
    }
  };
}
