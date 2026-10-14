/**
 * Eval expression within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} expression expression input accepted by the regression model.
 * @param {*} value value input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function evalExpression(context, expression, value) {
  return typeof expression === 'function' ? expression(value) : expression;
}
