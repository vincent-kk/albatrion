/**
 * Compute array within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @param {*} sid sid input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function computeArray(context, node, sid) {
  const raw = context.rawOf(node);
  if (raw !== undefined) {
    context.publish(node, sid, context.MISSING, raw);
    return;
  }
  const prev = node.local;
  const children = node.children;
  const kids = node.dirtyKids;
  if (prev !== context.MISSING && prev.length === children.length && node.omitTrailing === false && kids.length * 2 <= children.length) {
    let next = prev;
    for (let i = 0; i < kids.length; i++) {
      const child = kids[i];
      if (child.detached) continue;
      const m = context.emitOf(child, sid);
      const v = context.projectArrayItem(child, m);
      if (next[child.name] === v) continue;
      if (next === prev) next = prev.slice();
      next[child.name] = v;
    }
    context.publish(node, sid, next, next);
    return;
  }
  let end = children.length;
  if (node.omitTrailing) {
    while (end > 0) {
      const m = context.emitOf(children[end - 1], sid);
      if (m === context.MISSING || m === null) end--;else break;
    }
  }
  let same = prev !== context.MISSING && prev.length === end;
  if (same) {
    for (let i = 0; i < end; i++) {
      const m = context.emitOf(children[i], sid);
      if (prev[i] !== context.projectArrayItem(children[i], m)) {
        same = false;
        break;
      }
    }
  }
  if (same) {
    context.publish(node, sid, prev, prev);
    return;
  }
  const next = new Array(end);
  for (let i = 0; i < end; i++) {
    const m = context.emitOf(children[i], sid);
    next[i] = context.projectArrayItem(children[i], m);
  }
  context.publish(node, sid, next, next.length === 0 && node.schema?.options?.omitEmpty !== false ? context.MISSING : next);
}
