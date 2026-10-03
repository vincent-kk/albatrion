/**
 * Declare injections within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @param {*} rules rules input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function declareInjections(context, root, rules) {
  context.ensureRoot(root).injections = rules;
  for (let i = 0; i < rules.length; i++) rules[i].from.isSource = true;
}
