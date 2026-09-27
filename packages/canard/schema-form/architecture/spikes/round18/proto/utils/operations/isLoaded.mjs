/**
 * Is loaded within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} host host input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function isLoaded(context, host) {
  return host.callerLoaded;
}
