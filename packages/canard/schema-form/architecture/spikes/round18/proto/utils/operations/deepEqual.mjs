/**
 * Deep equal within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} a a input accepted by the regression model.
 * @param {*} b b input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function deepEqual(context, a, b) {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}
