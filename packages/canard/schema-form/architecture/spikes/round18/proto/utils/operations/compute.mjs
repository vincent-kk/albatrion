/**
 * Compute within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @param {*} sid sid input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function compute(context, node, sid) {
  context.counters.visited++;
  if (node.kind === 'leaf') {
    const r = context.rawOf(node);
    const empty = r === '' || r !== null && typeof r === 'object' && Object.keys(r).length === 0;
    const e = r === undefined || empty && node.schema?.options?.omitEmpty !== false ? context.MISSING : r;
    context.publish(node, sid, e, e);
    return;
  }
  const kids = node.dirtyKids;
  if (kids.length > 1) context.sortDirty(kids);
  for (let i = 0; i < kids.length; i++) if (kids[i].detached === false) context.compute(kids[i], sid);
  node.root.computedHosts.push(node);
  if (node.kind === 'array') context.computeArray(node, sid);else context.computeObject(node, sid);
}
