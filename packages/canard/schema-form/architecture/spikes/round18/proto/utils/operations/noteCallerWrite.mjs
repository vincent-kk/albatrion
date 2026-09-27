/**
 * Note caller write within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @param {*} node node input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function noteCallerWrite(context, root, node) {
  const log = root.autoLog;
  if (log === null || log.size === 0) return;
  for (const n of log.keys()) if (n === node || context.isAncestor(n, node) || context.isAncestor(node, n)) log.delete(n);
}
