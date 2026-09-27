/**
 * Is absent within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} n n input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function isAbsent(context, n) {
  return n.kind === 'leaf' ? context.rawOf(n) === undefined : n.absent;
}
