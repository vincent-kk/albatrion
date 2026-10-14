/**
 * Mark all within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function markAll(context, node) {
  node.dirty = true;
  const children = node.children;
  if (children === null) return;
  for (let i = 0; i < children.length; i++) {
    node.dirtyKids.push(children[i]);
    context.markAll(children[i]);
  }
}
