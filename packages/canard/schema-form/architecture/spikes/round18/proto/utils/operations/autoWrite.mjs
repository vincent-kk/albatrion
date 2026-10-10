/**
 * Auto write within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @param {*} node node input accepted by the regression model.
 * @param {*} value value input accepted by the regression model.
 * @param {*} rule rule input accepted by the regression model.
 * @param {*} host host input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function autoWrite(context, root, node, value, rule, host) {
  const log = root.autoLog;
  let entry = log.get(node);
  if (entry === undefined) {
    const inside = [];
    for (const n of log.keys()) if (context.isAncestor(node, n)) inside.push(n);
    for (let i = 0; i < inside.length; i++) if (log.has(inside[i])) context.retract(root, inside[i]);
    entry = {
      rule,
      host,
      value,
      baseAbsent: context.isAbsent(node),
      snap: context.snapshot(node)
    };
    log.set(node, entry);
  } else {
    entry.rule = rule;
    entry.host = host;
    entry.value = value;
  }
  context.stagingDepth++;
  try {
    context.applyValue(node, value, false);
  } finally {
    context.stagingDepth--;
  }
}
