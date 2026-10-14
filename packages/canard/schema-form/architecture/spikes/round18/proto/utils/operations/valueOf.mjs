/**
 * Value of within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function valueOf(context, node) {
  if (node.emit !== context.MISSING) return node.emit;
  if (node.parent === null && node.kind === 'object') return node.local;
  if (node.parent === null && node.kind === 'array') return node.local;
  return undefined;
}
