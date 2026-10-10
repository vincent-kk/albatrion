/**
 * Resolve default within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} host host input accepted by the regression model.
 * @param {*} child child input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function resolveDefault(context, host, child) {
  const plain = [];
  const expressions = [];
  for (const i of child.declaredBy ?? []) {
    if (!host.nextFragOn[i]) continue;
    const fragment = host.fragments[i];
    if (fragment.defaults && Object.hasOwn(fragment.defaults, child.name)) plain.push(fragment.defaults[child.name]);
    if (fragment.expressionDefaults && Object.hasOwn(fragment.expressionDefaults, child.name)) expressions.push(fragment.expressionDefaults[child.name]);
  }
  const pick = values => context.SWITCHES.DEFAULT_WINNER === 'first' ? values[0] : values.at(-1);
  const expression = expressions.length ? pick(expressions) : child.expressionDefault;
  if (expression !== undefined) return context.evalExpression(expression, context.expressionView(child.root));
  return plain.length ? pick(plain) : child.defaultValue;
}
