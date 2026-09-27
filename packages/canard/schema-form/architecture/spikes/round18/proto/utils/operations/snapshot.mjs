/**
 * Snapshot within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function snapshot(context, node) {
  const recs = [];
  context.snapNode(node, recs);
  const anc = [];
  for (let p = node.parent; p !== null; p = p.parent) anc.push(p, p.absent);
  return {
    recs,
    anc
  };
}
