/**
 * Retract within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @param {*} node node input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function retract(context, root, node) {
  const log = root.autoLog;
  const entry = log.get(node);
  log.delete(node);
  for (const n of log.keys()) if (context.isAncestor(node, n)) log.delete(n);
  context.restore(entry.snap);
  context.counters.retractions++;
  if (context.trace) context.lastSettle.retracted.push(context.pathOf(node));
}
