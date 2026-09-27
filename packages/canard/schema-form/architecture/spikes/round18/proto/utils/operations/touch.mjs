/**
 * Touch within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function touch(context, node) {
  let n = node;
  while (n.dirty === false) {
    n.dirty = true;
    const p = n.parent;
    if (p === null) break;
    p.dirtyKids.push(n);
    n = p;
  }
  return node.root;
}
