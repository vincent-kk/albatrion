/**
 * Extras keys within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} extras extras input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function extrasKeys(context, extras) {
  return context.SWITCHES.EXTRAS_ORDER === 'sorted' ? Object.keys(extras).sort() : Object.keys(extras);
}
