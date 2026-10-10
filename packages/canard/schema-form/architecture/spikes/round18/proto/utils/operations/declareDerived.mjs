/**
 * Declare derived within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @param {*} rules rules input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function declareDerived(context, root, rules) {
  const r = context.ensureRoot(root);
  const stored = rules.map(x => ({
    ...x,
    derived: true
  }));
  r.injections = [...r.injections, ...stored];
  for (let i = 0; i < stored.length; i++) stored[i].from.isSource = true;
  return stored;
}
