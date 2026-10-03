/**
 * Apply array within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @param {*} value value input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function applyArray(context, node, value) {
  context.markReplaced(node);
  const kids = node.children;
  while (kids.length > value.length) context.detachLast(node);
  for (let i = 0; i < value.length; i++) {
    if (i >= kids.length) {
      if (node.itemFactory === null) throw new Error('array needs an itemFactory to grow');
      context.attach(node, node.itemFactory(i));
    }
    context.applyValue(kids[i], value[i], false);
  }
}
