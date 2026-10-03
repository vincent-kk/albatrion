/**
 * Clone fast within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} o o input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function cloneFast(context, o) {
  context.counters.copies++;
  return {
    ...o
  };
}
