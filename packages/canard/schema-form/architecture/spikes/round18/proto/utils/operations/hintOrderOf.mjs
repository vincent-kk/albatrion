/**
 * Hint order of within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function hintOrderOf(context, node) {
  const prev = node.fragOn;
  const order = [];
  for (let i = 0; i < prev.length; i++) if (prev[i] === 1) order.push(i);
  for (let i = 0; i < prev.length; i++) if (prev[i] === 0) order.push(i);
  return order;
}
