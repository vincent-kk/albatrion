/**
 * Reconcile transition within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @param {*} sid sid input accepted by the regression model.
 * @param {*} dryRun dryRun input accepted by the regression model.
 * @param {*} suppressInjection suppressInjection input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function reconcileTransition(context, root, sid, dryRun, suppressInjection) {
  if (!suppressInjection && context.reconcileExits(root, dryRun)) return true;
  const hosts = [];
  context.visitNodes(root, node => {
    if (node.kind === 'object') hosts.push(node);
  });
  const log = root.autoLog;
  let wrote = false;
  for (const [node, entry] of [...log]) {
    if (!log.has(node) || entry.rule !== null || !root.fillValues.has(node) || context.existsInShape(node)) continue;
    if (dryRun) return true;
    context.retract(root, node);
    wrote = true;
  }
  if (wrote) return true;
  for (let h = 0; h < hosts.length; h++) {
    const host = hosts[h];
    if (host.kind !== 'object') continue;
    const want = suppressInjection ? null : context.wantedDefaults(root, host);
    if (want !== null) {
      for (const [c, v] of want) {
        if (log.has(c)) continue;
        wrote = true;
        if (dryRun) return true;
        context.counters.injections++;
        if (context.trace) context.lastSettle.injected.push(`${context.pathOf(c)}=${JSON.stringify(v)}`);
        context.autoWrite(root, c, v, null, host);
      }
    }
    const frags = host.fragments;
    const now = host.nextFragOn;
    for (let i = 0; i < frags.length; i++) {
      const overlays = frags[i].overlays;
      for (let k = 0; k < overlays.length; k++) {
        const child = host.index.get(overlays[k].host);
        const seen = context.fragOnOf(child, sid);
        const childIdx = child.fragments.findIndex(f => f.inherited && f.owner === host && f.ownerIdx === i);
        if (seen[childIdx] === now[i]) continue;
        wrote = true;
        if (dryRun) return true;
        context.touch(child);
      }
    }
  }
  return wrote;
}
