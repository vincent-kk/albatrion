/**
 * Combine controls within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} layers layers input accepted by the regression model.
 * @param {*} value value input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function combineControls(context, layers, value) {
  const result = {
    active: true,
    visible: true,
    readOnly: false,
    disabled: false
  };
  for (const layer of layers) {
    for (const key of context.controlKeys) {
      const expr = context.controlOption(layer, key) ?? layer?.[key];
      if (expr === undefined) continue;
      const v = !!context.evalExpression(expr, value);
      result[key] = context.SWITCHES.CONTROL_COMBINE === 'nearest' ? v : key === 'active' || key === 'visible' ? result[key] && v : result[key] || v;
    }
  }
  return result;
}
