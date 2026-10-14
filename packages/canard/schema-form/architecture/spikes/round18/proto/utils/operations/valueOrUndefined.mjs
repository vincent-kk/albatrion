/**
 * Value or undefined within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} v v input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function valueOrUndefined(context, v) {
  return v === context.MISSING ? undefined : v;
}
