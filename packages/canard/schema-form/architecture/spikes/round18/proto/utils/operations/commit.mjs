/**
 * Commit within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @param {*} sid sid input accepted by the regression model.
 * @param {*} out out input accepted by the regression model.
 * @param {*} signalOnly signalOnly input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function commit(context, node, sid, out, signalOnly) {
  let changed = false;
  if (node.controlNext !== null) {
    changed = !context.sameValue(node.controls, node.controlNext);
    node.controls = node.controlNext;
  }
  if (node.clearExpression !== undefined) node.clearWas = !!context.evalExpression(node.clearExpression, context.expressionView(node.root));
  if (node.hasPending) {
    node.raw = node.pendingRaw;
    node.hasPending = false;
    node.pendingRaw = undefined;
    if (node.kind === 'leaf' && node.raw !== node.reported) {
      node.signals |= context.REFRESH;
      if (context.trace) context.lastSettle.refreshed.push(context.pathOf(node));
    }
  }
  if (node.hasPendingExtras) {
    node.extras = node.pendingExtras;
    node.hasPendingExtras = false;
    node.pendingExtras = null;
  }
  const prevLocal = node.local;
  const prevEmit = node.emit;
  if (node.stamp === sid) {
    if (node.local !== node.nextLocal || node.emit !== node.nextEmit) changed = true;
    node.local = node.nextLocal;
    node.emit = node.nextEmit;
    node.localKeys = node.nextLocalKeys;
  }
  if (node.isSource && node.stamp === sid) {
    context.trackSourceRef(node, prevEmit);
    node.srcWritten = false;
  }
  if (node.settle !== null && node.stamp === sid) {
    const s = node.settle;
    const n = node.nextSettle;
    if (s.status !== n.status || s.sweeps !== n.sweeps) {
      s.status = n.status;
      s.sweeps = n.sweeps;
      changed = true;
    }
  }
  if (node.kind === 'object' && node.fragStamp === sid) {
    if (context.SWITCHES.EDGE_REF === 'entry' && node.entryFragEntry !== node.root.entryId && context.sameOn(node.fragOn, node.nextFragOn) === false) {
      node.entryFragOn.set(node.fragOn);
      node.entryFragEntry = node.root.entryId;
    }
    const tmp = node.fragOn;
    node.fragOn = node.nextFragOn;
    node.nextFragOn = tmp;
    const cond = node.conditionalKids;
    for (let i = 0; i < cond.length; i++) cond[i].active = cond[i].actNext;
  }
  node.replaced = false;
  const ownExit = context.controlOption(node.schema, 'unsetOnInactive');
  node.committedUnsetOnInactive = ownExit !== undefined ? !!context.evalExpression(ownExit, context.expressionView(node.root)) : node.parent?.committedUnsetOnInactive ?? !!node.root.options.unsetOnInactive;
  node.dirty = false;
  if (changed || node.signals !== 0) {
    const wants = node.listeners !== null || node.parent === null;
    const entry = {
      node,
      payload: wants ? context.payloadOf(node, prevLocal, prevEmit) : null
    };
    if (changed) out.push(entry);else signalOnly.push(entry);
  }
  if (node.children !== null) {
    const kids = node.dirtyKids;
    for (let i = 0; i < kids.length; i++) {
      const k = kids[i];
      if (k.detached) {
        k.dirty = false;
        continue;
      }
      context.commit(k, sid, out, signalOnly);
    }
    kids.length = 0;
  }
}
