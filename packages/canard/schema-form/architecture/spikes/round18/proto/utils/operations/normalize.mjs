/**
 * Normalize within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} o o input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function normalize(context, o) {
  context.counters.normalizes++;
  return {
    ...o
  };
}
