/**
 * Reset within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @param {*} options options input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function reset(context, root, options = {}) {
  context.setValue(root, root.initialValue, options);
}
