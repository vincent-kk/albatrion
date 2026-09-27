/**
 * Mark all fresh within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function markAllFresh(context, node) {
  node.dirty = true;
  if (!node.children) return;
  node.dirtyKids = node.children.slice();
  for (const child of node.children) context.markAllFresh(child);
}
