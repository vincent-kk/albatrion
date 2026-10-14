/**
 * Prime within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @param {*} value value input accepted by the regression model.
 * @param {*} opts opts input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function prime(context, root, value, opts) {
  context.ensureRoot(root);
  if (opts) Object.assign(root.options, opts);
  root.initialValue = value;
  context.markAll(root);
  context.setValue(root, value === undefined ? {} : value);
  return root;
}
