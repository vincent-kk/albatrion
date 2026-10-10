/**
 * Update controls within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function updateControls(context, root) {
  const value = context.expressionView(root);
  const walk = (node, inherited) => {
    const layers = [...inherited];
    for (const scope of node.controlLayers) if (scope.when(value)) layers.push(scope.schema);
    if (node.parent) {
      const children = context.controlOption(node.parent.schema, 'children');
      if (children?.[node.name]) layers.push(children[node.name]);
    }
    layers.push(node.schema);
    const next = context.combineControls(layers, value);
    if (!context.sameValue(node.controlNext ?? node.controls, next)) context.touch(node);
    node.controlNext = next;
    if (node.clearExpression !== undefined && !!context.evalExpression(node.clearExpression, value) !== node.clearWas) context.touch(node);
    for (const child of node.children ?? []) walk(child, layers);
  };
  walk(root, [root.options.form ?? {}]);
}
