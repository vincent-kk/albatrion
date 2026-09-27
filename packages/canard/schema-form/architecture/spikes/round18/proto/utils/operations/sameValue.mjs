/**
 * Same value within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} a a input accepted by the regression model.
 * @param {*} b b input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function sameValue(context, a, b) {
  return a === b || typeof a === 'object' && typeof b === 'object' && a !== null && b !== null && context.deepEqual(a, b);
}
