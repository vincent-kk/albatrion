/**
 * Erase within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function erase(context, node) {
  if (context.loadDepth > 0 && node.isSource) context.markSourceLoaded(node);
  if (node.isSource && context.inSettle === false) context.markSourceWritten(node);
  if (node.kind === 'leaf') {
    if (context.rawOf(node) !== undefined) context.stageRaw(node, undefined);else context.touch(node);
    return;
  }
  if (context.rawOf(node) !== undefined) context.stageRaw(node, undefined);else context.touch(node);
  node.absent = true;
  if (node.kind === 'object') {
    node.pendingExtras = null;
    node.hasPendingExtras = true;
  }
  context.markReplaced(node);
  const kids = node.children;
  for (let i = 0; i < kids.length; i++) context.erase(kids[i]);
}
