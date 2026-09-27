/**
 * Subscribe within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @param {*} listener listener input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function subscribe(context, node, listener) {
  if (node.listeners === null) node.listeners = [];
  node.listeners.push(listener);
  return () => {
    const i = node.listeners.indexOf(listener);
    if (i >= 0) node.listeners.splice(i, 1);
  };
}
