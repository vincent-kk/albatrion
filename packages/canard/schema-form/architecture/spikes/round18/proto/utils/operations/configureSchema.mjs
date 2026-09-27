/**
 * Configure schema within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @param {*} schema schema input accepted by the regression model.
 * @param {*} options options input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function configureSchema(context, root, schema, options = {}) {
  context.ensureRoot(root);
  root.schemaMode = true;
  root.schema = schema;
  Object.assign(root.options, options);
  return root;
}
