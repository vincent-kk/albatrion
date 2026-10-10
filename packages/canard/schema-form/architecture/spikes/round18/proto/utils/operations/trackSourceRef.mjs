/**
 * Track source ref within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @param {*} prevEmit prevEmit input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function trackSourceRef(context, node, prevEmit) {
  const root = node.root;
  if (node.loaded && context.SWITCHES.LOAD_EDGE !== 'ref') {
    if (context.SWITCHES.AUTO_SCOPE === 'settle') {
      node.edgeRef = node.emit;
      node.edgeRefEntry = root.entryId;
    }
    return;
  }
  if (node.edgeRefEntry === root.entryId || prevEmit === node.emit) return;
  node.edgeRef = prevEmit;
  node.edgeRefEntry = root.entryId;
}
