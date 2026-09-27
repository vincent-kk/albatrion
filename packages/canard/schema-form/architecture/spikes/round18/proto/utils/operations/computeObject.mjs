/**
 * Compute object within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @param {*} sid sid input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function computeObject(context, node, sid) {
  const raw = context.rawOf(node);
  const nonObject = raw !== undefined;
  const frags = node.fragments;
  const nFrag = frags.length;
  const on = node.nextFragOn;
  on.fill(0);
  let status = 'stable';
  let sweeps = 0;
  node.fragStamp = sid;
  if (nFrag === 0) {
    const L = context.compose(node, sid, true);
    context.publishHost(node, sid, L, nonObject, raw, status, sweeps);
    return;
  }
  for (let i = 0; i < nFrag; i++) {
    const f = frags[i];
    if (f.inherited) on[i] = context.fragOnOf(f.owner, sid)[f.ownerIdx];
  }
  const cap = nFrag + 1;
  if (context.SWITCHES.ORDER_HINT) node.hintOrder = context.hintOrderOf(node);
  context.applyActive(node, on);
  node.nextLocal = context.compose(node, sid, context.sameOn(on, node.fragOn));
  for (;;) {
    sweeps++;
    context.counters.sweeps++;
    if (context.sweepOnce(node, on, sid, nonObject) === false) break;
    if (sweeps >= cap) {
      status = 'budget-exceeded';
      context.lastSettle.hostExceeded = true;
      break;
    }
  }
  if (sweeps > context.lastSettle.maxSweepsOnOneHost) context.lastSettle.maxSweepsOnOneHost = sweeps;
  context.publishHost(node, sid, node.nextLocal, nonObject, raw, status, sweeps);
}
