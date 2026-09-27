/**
 * Extras of within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} n n input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function extrasOf(context, n) {
  return n.hasPendingExtras ? n.pendingExtras : n.extras;
}
