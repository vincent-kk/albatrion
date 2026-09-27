/**
 * Clear non object ancestors within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function clearNonObjectAncestors(context, node) {
  context.markPresent(node);
  for (let p = node.parent; p !== null; p = p.parent) {
    if (context.rawOf(p) !== undefined) context.stageRaw(p, undefined);
  }
}
