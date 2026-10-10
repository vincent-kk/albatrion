/**
 * End entry scope within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function endEntryScope(context, root) {
  if (root.autoLog !== null) root.autoLog.clear();
  context.clearLoaded(root);
}
