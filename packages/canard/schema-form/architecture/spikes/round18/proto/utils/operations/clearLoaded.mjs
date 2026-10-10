/**
 * Clear loaded within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function clearLoaded(context, root) {
  const list = root.loadedList;
  if (list === null) return;
  for (let i = 0; i < list.length; i++) {
    list[i].callerLoaded = false;
    list[i].loaded = false;
  }
  list.length = 0;
}
