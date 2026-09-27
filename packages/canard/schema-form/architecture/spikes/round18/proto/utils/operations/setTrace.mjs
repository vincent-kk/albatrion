/**
 * Set trace within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} on on input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function setTrace(context, on) {
  context.trace = on;
}
