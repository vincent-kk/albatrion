/**
 * Auto entries within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function autoEntries(context, root) {
  const out = [];
  for (const [n, e] of root.autoLog) {
    out.push({
      path: context.pathOf(n),
      value: e.value,
      kind: e.kind ?? (e.rule === null ? 'default' : e.rule.derived === true ? 'derived' : 'injectTo'),
      host: e.host === null ? null : context.pathOf(e.host)
    });
  }
  return out;
}
