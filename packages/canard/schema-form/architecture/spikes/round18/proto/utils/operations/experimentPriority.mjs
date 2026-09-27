/**
 * Experiment priority within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} item item input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function experimentPriority(context, item) {
  if (item.kind === 'clearValue') return context.SWITCHES.CLEAR_PRIORITY === 'clear-wins' ? 2 : -1;
  if (context.SWITCHES.WRITE_CONFLICT === 'inject-wins') return item.kind === 'injectTo' ? 1 : 0;
  if (context.SWITCHES.WRITE_CONFLICT === 'derived-wins') return item.kind === 'derived' ? 1 : 0;
  return 0;
}
