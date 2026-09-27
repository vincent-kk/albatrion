/**
 * Raw of within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} n n input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function rawOf(context, n) {
  return n.hasPending ? n.pendingRaw : n.raw;
}
