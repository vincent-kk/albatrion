/**
 * Set switches within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} values values input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function setSwitches(context, values) {
  const prev = {
    ...context.SWITCHES
  };
  Object.assign(context.SWITCHES, values);
  return prev;
}
