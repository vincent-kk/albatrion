/**
 * Mark replaced within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} host host input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function markReplaced(context, host) {
  if (context.inSettle === false && host.callerLoaded === false) {
    host.callerLoaded = true;
    host.root.loadedList.push(host);
  }
  if (host.replaced) return;
  host.replaced = true;
  host.root.replacedHosts.push(host);
}
