/**
 * Same on within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} a a input accepted by the regression model.
 * @param {*} b b input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function sameOn(context, a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
