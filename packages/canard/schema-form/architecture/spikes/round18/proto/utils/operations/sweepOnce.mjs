/**
 * Sweep once within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @param {*} on on input accepted by the regression model.
 * @param {*} sid sid input accepted by the regression model.
 * @param {*} nonObject nonObject input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function sweepOnce(context, node, on, sid, nonObject) {
  const frags = node.fragments;
  const order = context.SWITCHES.ORDER_HINT ? node.hintOrder : null;
  let changed = false;
  for (let k = 0; k < frags.length; k++) {
    const i = order === null ? k : order[k];
    const f = frags[i];
    let v;
    if (f.parentIdx >= 0 && on[f.parentIdx] === 0) v = 0;else if (f.inherited) v = context.fragOnOf(f.owner, sid)[f.ownerIdx];else {
      context.counters.guards++;
      v = f.guard === null || f.guard(nonObject ? context.EMPTY_LOCAL : node.nextLocal) ? 1 : 0;
    }
    if (v === on[i]) continue;
    on[i] = v;
    changed = true;
    context.applyActive(node, on);
    node.nextLocal = context.compose(node, sid, context.sameOn(on, node.fragOn));
  }
  return changed;
}
