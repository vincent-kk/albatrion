/**
 * Attach within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} parent parent input accepted by the regression model.
 * @param {*} child child input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function attach(context, parent, child) {
  child.parent = parent;
  child.pos = parent.children.length;
  child.detached = false;
  parent.children.push(child);
  if (parent.kind === 'object') parent.index.set(child.name, child);
  context.setRoot(child, parent.root ?? parent);
  return child;
}
